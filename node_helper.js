var NodeHelper = require("node_helper");
var msal = require("@azure/msal-node");
var axios = require("axios");
var puppeteer = require('puppeteer');

module.exports = NodeHelper.create({
    // Global variable to store the token content
    token: null,
    calendar: null,
    meetList: null,
    groupedEvents: null,

    // Method called when the Node Helper is initialized
    start: function () {
        console.log("Starting node helper for MMM-TeamsCalendar");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_MSG_FRONT") {
            this.openNavigator();
        }
    },

    sendMessage: function () {
        console.log("Sending message to front-end");
        this.sendSocketNotification("GET_MSG_BACK", this.groupedEvents);
    },

    fetchData: async function() {
        console.log(this.token);

        // Get the current date
        const today = new Date();

        // Get the start date and time as the current moment
        const startDate = today.toISOString();

        // Create end date for 7 days from now in São Paulo timezone
        const endDate = new Date(today.setDate(today.getDate() + 7)).toISOString();

        let query = await axios.get(`https://graph.microsoft.com/v1.0/me/calendarview`, {
            params: {
                startdatetime: startDate,
                enddatetime: endDate
            },
            headers: {
                'Authorization': `Bearer ${this.token}`,  // Replace with the correct token
                'Prefer': 'outlook.timezone="America/Sao_Paulo"'  // Set São Paulo timezone
            }
        });

        this.calendar = query.data;
        this.manageData();
    },

    openNavigator: async function() {
        try {
            // Start the browser
            const browser = await puppeteer.launch({ headless: false, userDataDir: './puppeteer_data'}); // Use { headless: true } for headless mode
            const page = await browser.newPage();
            
            // Navigate to the desired URL
            const url = 'http://localhost:3000/auth';
            await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until the network is idle

            // Wait for the body to be available
            await page.waitForSelector('body'); 
            
            // Get the content of <body>
            const bodyContent = await page.evaluate(() => document.body.innerText);
            
            this.token = bodyContent;
            await browser.close();
            this.fetchData();
            
        } catch (error) {
            console.error("Error:", error);
        }
    },

    manageData: function (){
        this.meetList = [];

        const data = this.calendar.value; 
        data.forEach(meet => {
            const tempObj = { 
                subject: meet.subject, 
                start: meet.start, 
                end: meet.end
            };
            this.meetList.push(tempObj);
        });

        this.separateByWeekday();

        // Top code
        // this.meetList = this.calendar.value.map(({ subject, start, end }) => ({
        //     subject,
        //     start,
        //     end
        // }));
    },

    separateByWeekday: function () {
        this.groupedEvents = {};
    
        this.meetList.forEach(event => {
            // Convert start date to a Date object
            const startDate = new Date(event.start.dateTime);
            const endDate = new Date(event.end.dateTime);
            const dayName = this.getDayName(startDate);
    
            // Check if the day already exists in the object
            if (!this.groupedEvents[dayName]) {
                this.groupedEvents[dayName] = [];
            }
    
            // Add the event to the correct group
            this.groupedEvents[dayName].push({
                subject: event.subject,
                start: this.formatDate(startDate),
                end: this.formatDate(endDate),
                orderFromDate: event.start.dateTime
            });
        });

        const entries = Object.entries(this.groupedEvents);
        entries.sort((a, b) => {
            const startA = new Date(a[1][0].orderFromDate);
            const startB = new Date(b[1][0].orderFromDate);
            return startA - startB;
        });
        
        this.groupedEvents = Object.fromEntries(entries);
        
        // Sending to front
        this.sendMessage();
    },
    
    getDayName: function(date) {
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
            'Thursday', 'Friday', 'Saturday'
        ];
        return days[date.getDay()];
    },

    formatDate: function(dateTime) {
        const date = new Date(dateTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month} - ${hours}:${minutes}`;
    },
});
