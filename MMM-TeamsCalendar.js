Module.register("MMM-TeamsCalendar", {
    // Default module settings
    defaults: {
        updateInterval: 600000 // Updates every 10 minutes
    },

    getStyles: function() {
        return ["MMM-TeamsCalendar.css"];
    },

    start: function () {
        this.text = ""; // Initially empty
        this.sendMessage();
        this.scheduleUpdate();
    },

    getDom: function () {
        const wrapper = document.createElement("div");
    
        // Create and add the title
        const header = document.createElement("div");
        header.className = "meet-header";
        header.innerText = "Work meetings";
        wrapper.appendChild(header);

        // Create a line
        const line = document.createElement("hr");
        line.className = "line";
        wrapper.appendChild(line);
    
        // Create and add the data
        const data = document.createElement("div");
        data.innerHTML = this.text;
        wrapper.appendChild(data);
    
        return wrapper;
    },
    sendMessage: function () {
        console.log("#####################################");
        console.log("MESSAGE SENT");
        this.sendSocketNotification("GET_MSG_FRONT");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_MSG_BACK") {
            console.log("Message received from backend:", payload);
            this.text = this.formatPayload(payload); // Update the state variable
            this.updateDom(); // Update the module DOM
        }
    },

    formatPayload: function(payload) {
        let formattedString = "";

        for (const [day, events] of Object.entries(payload)) {

            formattedString += `<div class="day-week">${day}:</div>`;
            
            events.forEach(event => {
                const [eventDate, eventTime] = event.start.split(' - ');
                formattedString += `<div class="meet-week">${eventDate} - ${event.subject} - ${eventTime}</div>`;
            });
        }

        return formattedString;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.sendMessage();
        }, this.config.updateInterval);
    }
});
