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
    return {
      state: "none",
      seq: null,
      pressLayout(code, shift) {
        const entry = (shift ? layout.keymap1 : layout.keymap0)?.[code];
        if (!entry) return "";
        let out = "";
        if (entry.type === "output") {
          if (this.state !== "none") {
            out += layout.terminators[this.state] || "";
            this.state = "none";
          }
          return out + entry.value;
        }
        const table = layout.actions[entry.value];
        if (!table) return "";
        let action = table[this.state];
        if (!action) {
          if (this.state !== "none") {
            out += layout.terminators[this.state] || "";
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
          const out = layout.terminators[this.state] || "";
          this.state = "none";
          return out;
        }
        return "";
      },
      reset() { this.seq = null; this.state = "none"; },
      hasPending() { return this.seq !== null || this.state !== "none"; }
    };
  }

  async function init(textarea, onStatus) {
    const response = await fetch("./data/kgp.json");
    if (!response.ok) throw new Error("Could not load Nudi keyboard layout");
    const layout = await response.json();
    const engine = createEngine(layout);
    let kannadaMode = true;
    let lastCaret = textarea.selectionStart;
    let commitTimer = null;
    const COMMIT_DELAY = 250;

    function scheduleCommit() {
      clearTimeout(commitTimer);
      commitTimer = setTimeout(() => {
        const committed = engine.flush();
        if (committed) insert(committed);
      }, COMMIT_DELAY);
    }

    function insert(text) {
      if (!text) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText(text, start, end, "end");
      lastCaret = textarea.selectionStart;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    textarea.addEventListener("keydown", event => {
      if (event.key === "F9") {
        event.preventDefault();
        kannadaMode = !kannadaMode;
        clearTimeout(commitTimer);
        engine.reset();
        onStatus?.(kannadaMode ? "NUDI / KANNADA ON" : "ENGLISH ON");
        return;
      }
      if (!kannadaMode || event.ctrlKey || event.metaKey || event.altKey) return;

      if (textarea.selectionStart !== lastCaret) { clearTimeout(commitTimer); engine.reset(); }

      if (event.code === "Backspace") {
        if (engine.backspace()) {
          event.preventDefault();
          clearTimeout(commitTimer);
          lastCaret = textarea.selectionStart;
          return;
        }
        return;
      }

      const code = CODE_MAP[event.code];
      if (code === undefined) return;

      event.preventDefault();
      if (code === 49 || code === 36) {
        insert(engine.flush() + (code === 49 ? " " : "\n"));
        return;
      }
      if (code === 48) {
        insert(engine.flush() + "\t");
        return;
      }
      clearTimeout(commitTimer);
      const output = engine.press(code, event.shiftKey);
      insert(output);
      lastCaret = textarea.selectionStart;
      if (engine.hasPending()) scheduleCommit();
    });

    textarea.addEventListener("click", () => {
      clearTimeout(commitTimer);
      if (textarea.selectionStart !== lastCaret) engine.reset();
      lastCaret = textarea.selectionStart;
    });
    textarea.addEventListener("keyup", () => { lastCaret = textarea.selectionStart; });
    onStatus?.("NUDI / KANNADA ON");
    return { setKannadaMode(value) { kannadaMode = !!value; engine.reset(); }, getKannadaMode() { return kannadaMode; } };
  }

  window.NudiKeyboard = { init };
})();
