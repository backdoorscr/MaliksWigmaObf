(function () {
  const inputEl = document.getElementById("input");
  const outputEl = document.getElementById("output");
  const obfuscateBtn = document.getElementById("obfuscateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");
  const statusEl = document.getElementById("status");

  function setStatus(message, isError = false) {
    statusEl.textContent = message || "";
    statusEl.style.color = isError ? "#f97373" : "#9ca3af";
  }

  /* ---------------------------------------------------------
     STRING OBFUSCATION
     Converts "abc" → "\097\098\099"
  --------------------------------------------------------- */
  function escapeStringLiterals(code) {
    return code.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, inner) => {
      let escaped = "";
      for (let i = 0; i < inner.length; i++) {
        escaped += "\\" + inner.charCodeAt(i).toString().padStart(3, "0");
      }
      return `"${escaped}"`;
    });
  }

  /* ---------------------------------------------------------
     VARIABLE RENAME
     Converts: local x = ...  →  local _a = ...
     Repeats _b, _c, _d...
  --------------------------------------------------------- */
  function renameLocals(code) {
    let counter = 0;
    const nameMap = {};

    return code.replace(/\blocal\s+([A-Za-z_][A-Za-z0-9_]*)/g, (match, varName) => {
      if (!nameMap[varName]) {
        const newName = "_" + String.fromCharCode(97 + (counter++)); // _a, _b, _c...
        nameMap[varName] = newName;
      }
      return "local " + nameMap[varName];
    }).replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match, name) => {
      return nameMap[name] || name;
    });
  }

  /* ---------------------------------------------------------
     ONE-LINE FLATTEN
  --------------------------------------------------------- */
  function flatten(code) {
    return code
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(" ")
      .replace(/\s+/g, " ");
  }

  /* ---------------------------------------------------------
     FULL OBFUSCATION PIPELINE
  --------------------------------------------------------- */
  function obfuscateLuau(source) {
    let out = source;

    out = escapeStringLiterals(out);
    out = renameLocals(out);
    out = flatten(out);

    return "-- obfuscated by Malik's wigma obf\n" + out;
  }

  /* ---------------------------------------------------------
     UI LOGIC
  --------------------------------------------------------- */
  function handleObfuscate() {
    setStatus("");

    const source = inputEl.value || "";
    if (!source.trim()) {
      setStatus("Please paste some Luau to obfuscate.", true);
      outputEl.value = "";
      return;
    }

    const result = obfuscateLuau(source);
    outputEl.value = result;
    setStatus("Obfuscation complete.");
  }

  function handleClear() {
    inputEl.value = "";
    outputEl.value = "";
    setStatus("Cleared.");
  }

  async function handleCopy() {
    const text = outputEl.value || "";
    if (!text.trim()) {
      setStatus("Nothing to copy yet.", true);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied obfuscated code.");
    } catch (err) {
      console.error(err);
      setStatus("Copy failed. Copy manually.", true);
    }
  }

  obfuscateBtn.addEventListener("click", handleObfuscate);
  clearBtn.addEventListener("click", handleClear);
  copyBtn.addEventListener("click", handleCopy);
})();
