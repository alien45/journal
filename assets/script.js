setTimeout(() => {
    // On-click copy code
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

    // add a dark mode toggle
    const btnWrap = document.createElement("div");
    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.textContent = getBtnText(isDark());
    btnWrap.appendChild(btn);
    document.body.appendChild(btnWrap);
    document.body.classList.add(isDark() ? "dark" : "light");
    const handleToggleClick = (event) => {
        event.preventDefault();
        const btn = event.target;
        const dark = document.body.classList.contains("light")
            ? false
            : document.body.classList.contains("dark") || isDark();
        console.log({ dark, currentText: btn.textContent, text: getBtnText(dark) });
        btn.textContent = getBtnText(!dark);
        document.body.classList.add(dark ? "light" : "dark");
        document.body.classList.remove(dark ? "dark" : "light");
    };

    document.body.addEventListener("click", (event) => {
        switch (event.target.nodeName) {
            case "PRE":
                iconClickHandler(event);
                break;
            case "BUTTON":
                console.log(event.target.id);
                if (!event.target.id === "theme-toggle") return;
                handleToggleClick(event);
                break;
        }
    });
}, 100);

const isDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
const getBtnText = (dark) => (dark ? "☀ Light" : "🌙 Dark");
