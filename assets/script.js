const btnToggleId = "theme-toggle";
const getBtnText = (dark) => (dark ? "☀ Light" : "🌙 Dark");
const isDark = () =>
    localStorage.getItem("dark") === true ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

// Handle copy code icon click
const iconClickHandler = async (event) => {
    const iconWidth = 50; //px
    const iconHeight = 22; //px
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    const icCopyIconClicked =
        x >= rect.x &&
        x <= rect.x + iconWidth &&
        y >= rect.y &&
        y <= rect.y + iconHeight;
    if (!icCopyIconClicked) return;

    event.preventDefault();
    const codeStr = event.target.textContent;
    let success = false;
    try {
        await navigator.clipboard.writeText(codeStr);
        success = true;
    } catch (err) {
        const el = document.createElement("textarea");
        el.value = codeStr;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();

        success = document.execCommand("copy");
        document.body.removeChild(el);
    }
    console.log("Code copied:", success);
    if (!success) return;

    event.target.classList.add("copied");
    setTimeout(() => {
        event.target.classList.remove("copied");
    }, 1000);
};

/** Handle theme toggle button click */
const handleToggleClick = (event) => {
    event.preventDefault();
    const btn = event.target;
    const dark = isDark();
    btn.textContent = getBtnText(!dark);
    document.body.classList.add(dark ? "light" : "dark");
    document.body.classList.remove(dark ? "dark" : "light");
    localStorage.setItem("dark", !dark);
};

/** Add theme toggle button */
const toggleBtnSetup = () => {
    const btnWrap = document.createElement("div");
    const btn = document.createElement("button");
    btn.id = btnToggleId;
    const dark = isDark();
    btn.textContent = getBtnText(dark);
    btnWrap.appendChild(btn);
    document.body.appendChild(btnWrap);
    document.body.classList.add(dark ? "dark" : "light");
};

setTimeout(() => {
    toggleBtnSetup();

    document.body.addEventListener("click", (event) => {
        switch (event.target.nodeName) {
            case "PRE":
                iconClickHandler(event);
                break;
            case "BUTTON":
                if (event.target.id !== btnToggleId) return;
                handleToggleClick(event);
                break;
        }
    });
}, 100);
