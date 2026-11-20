/* Nudi / KGP keyboard engine.
 * Layout data: sanchaya/typing-kannada, data/layouts/kgp.json.
 * Implements the KGP/Nudi keymap state machine for direct physical-key input.
 */
(() => {
  const CODE_MAP = {
    KeyA:0,KeyS:1,KeyD:2,KeyF:3,KeyH:4,KeyG:5,KeyZ:6,KeyX:7,KeyC:8,KeyV:9,
    KeyB:11,KeyQ:12,KeyW:13,KeyE:14,KeyR:15,KeyY:16,KeyT:17,
    Digit1:18,Digit2:19,Digit3:20,Digit4:21,Digit6:22,Digit5:23,Equal:24,
    Digit9:25,Digit7:26,Minus:27,Digit8:28,Digit0:29,
    BracketRight:30,KeyO:31,KeyU:32,BracketLeft:33,KeyI:34,KeyP:35,
    Enter:36,KeyL:37,KeyJ:38,Quote:39,KeyK:40,Semicolon:41,Backslash:42,
    Comma:43,Slash:44,KeyN:45,KeyM:46,Period:47,Tab:48,Space:49,
    Backquote:50,Backspace:51
  };

  function createEngine(layout) {
    // The KGP data marks a consonant+virama terminator with U+200C (ZWNJ).
    // That character explicitly blocks the next consonant from forming an
    // ottakshara. Nudi typing uses the virama as a joiner, so remove the
    // non-joiner only when committing a pending halant state.
    function terminator(state) {
      const value = layout.terminators[state] || "";
      return state && state.endsWith("್") ? value.replace(/[\u200C\u200D]/g, "") : value;
    }

    return {
      state: "none",
      seq: null,
      pressLayout(code, shift) {
        const entry = (shift ? layout.keymap1 : layout.keymap0)?.[code];
        if (!entry) return "";
        let out = "";
        if (entry.type === "output") {
          if (this.state !== "none") {
            out += terminator(this.state);
            this.state = "none";
          }
          return out + entry.value;
        }
        const table = layout.actions[entry.value];
        if (!table) return "";
        let action = table[this.state];
        if (!action) {
          if (this.state !== "none") {
            out += terminator(this.state);
            this.state = "none";
          }
          action = table.none;
        }
        if (action) {
          if (Object.prototype.hasOwnProperty.call(action, "output")) {
            out += action.output;
            this.state = "none";
          } else if (action.next) {
            this.state = action.next;
          }
        }
        return out;
      },
      press(code, shift) {
        if (this.seq !== null) {
          const hit = layout.historicSeq?.[code * 2 + (shift ? 1 : 0)];
          this.seq = null;
          if (hit) return hit;
          return (layout.historicPrefixChar ?? "`") + this.pressLayout(code, shift);
        }
        if (layout.historicPrefixCode === code && !shift && layout.historicSeq) {
          this.seq = layout.historicPrefixChar ?? "`";
          return "";
        }
        return this.pressLayout(code, shift);
      },
      backspace() {
        if (this.seq !== null || this.state !== "none") {
          this.seq = null;
          this.state = "none";
          return true;
        }
        return false;
      },
      flush() {
        if (this.seq !== null) {
          const out = this.seq;
          this.seq = null;
          return out;
        }
        if (this.state !== "none") {
          const out = terminator(this.state);
          this.state = "none";
          return out;
        }
        return "";
      },
      reset() { this.seq = null; this.state = "none"; },
      pendingPreview() {
        if (this.seq !== null) return this.seq;
        return this.state === "none" ? "" : (terminator(this.state));
      },
      hasPending() { return this.seq !== null || this.state !== "none"; }
    };
  }

  async function init(textarea, onStatus) {
    const response = await fetch("./data/kgp.json");
    if (!response.ok) throw new Error("Could not load Nudi keyboard layout");
    const layout = await response.json();
    const engine = createEngine(layout);
    let kannadaMode = true;
    let pendingRange = null;
    let lastCaret = textarea.selectionStart;

    function removePendingPreview() {
      if (!pendingRange) return;
      const { start, end } = pendingRange;
      const value = textarea.value;
      textarea.value = value.slice(0, start) + value.slice(end);
      textarea.setSelectionRange(start, start);
      pendingRange = null;
    }

    function insertCommittedAndPreview(committed) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const preview = engine.pendingPreview();
      const text = committed + preview;
      textarea.setRangeText(text, start, end, "end");
      if (preview) {
        pendingRange = {
          start: start + committed.length,
          end: start + committed.length + preview.length
        };
      }
      lastCaret = textarea.selectionStart;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function committedText() {
      if (!pendingRange) return textarea.value;
      const value = textarea.value;
      return value.slice(0, pendingRange.start) + value.slice(pendingRange.end);
    }

    textarea.addEventListener("keydown", event => {
      if (event.key === "F9") {
        event.preventDefault();
        removePendingPreview();
        kannadaMode = !kannadaMode;
        engine.reset();
        onStatus?.(kannadaMode ? "NUDI / KANNADA ON" : "ENGLISH ON");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      if (!kannadaMode || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Tab") return;

      if (textarea.selectionStart !== lastCaret && !pendingRange) {
        engine.reset();
      }

      if (event.code === "Backspace") {
        if (engine.hasPending()) {
          event.preventDefault();
          removePendingPreview();
          engine.backspace();
          lastCaret = textarea.selectionStart;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return;
      }

      const code = CODE_MAP[event.code];
      if (code === undefined) return;
      event.preventDefault();

      // The visible preview is only a display of the pending state.
      // Remove it before feeding the next key into the state machine.
      removePendingPreview();

      const output = engine.press(code, event.shiftKey);
      insertCommittedAndPreview(output);
    });

    textarea.addEventListener("click", () => {
      if (pendingRange && textarea.selectionStart !== pendingRange.end) {
        // A click away commits the visible preview as ordinary text.
        pendingRange = null;
        engine.reset();
      }
      lastCaret = textarea.selectionStart;
    });

    textarea.addEventListener("input", () => {
      lastCaret = textarea.selectionStart;
    });

    onStatus?.("NUDI / KANNADA ON");
    return {
      getCommittedText: committedText,
      setKannadaMode(value) {
        removePendingPreview();
        kannadaMode = !!value;
        engine.reset();
      },
      getKannadaMode() { return kannadaMode; }
    };
  }

  window.NudiKeyboard = { init };
})();
