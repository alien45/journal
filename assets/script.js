setTimeout(() => {
    // On-click copy code
    const clickHandler = async (event) => {
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
    document.body.addEventListener("click", clickHandler);
}, 100);
