// See https://cloud.google.com/dialogflow/docs/fulfillment-webhook
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

// Mock student data
const studentData = {
  name: "Alex Johnson",
  id: "12345678",
  major: "Computer Science",
  year: "Junior",
  courses: [
    {code: "CS301", name: "Algorithms", schedule: "MWF 10:00-10:50", location: "Tech Building 305"},
    {code: "MATH250", name: "Linear Algebra", schedule: "TR 11:30-12:45", location: "Science Hall 210"},
    {code: "ENG220", name: "Technical Writing", schedule: "MW 2:00-3:15", location: "Humanities 110"},
    {code: "PHYS200", name: "Physics II", schedule: "TR 9:00-10:15", location: "Science Hall 150"}
  ]
};

// Mock course data
const courseData = {
  "CS101": {
    description: "Introduction to computer science and programming concepts",
    prerequisites: "None",
    semesters: "Fall, Spring"
  },
  "BIO220": {
    description: "Fundamentals of molecular biology and genetics",
    prerequisites: "BIO101, CHEM101",
    semesters: "Spring"
  },
  "MATH150": {
    description: "Introduction to differential and integral calculus",
    prerequisites: "MATH120 or placement exam",
    semesters: "Fall, Spring, Summer"
  },
  "PSYCH300": {
    description: "Research methods in psychological science",
    prerequisites: "PSYCH101, STATS200",
    semesters: "Fall"
  }
};

// Mock events data
const eventsData = {
  sports: [
    {name: "Basketball vs. State University", date: "March 15", time: "7:00 PM", location: "University Arena"},
    {name: "Soccer Tournament", date: "March 20-22", time: "All day", location: "Athletic Fields"}
  ],
  academic: [
    {name: "Guest Lecture: AI Ethics", date: "March 18", time: "4:00 PM", location: "Science Hall Auditorium"},
    {name: "Research Symposium", date: "April 5", time: "1:00-5:00 PM", location: "Student Center"}
  ],
  social: [
    {name: "Spring Festival", date: "April 10", time: "12:00-8:00 PM", location: "Main Quad"},
    {name: "International Food Fair", date: "March 25", time: "6:00 PM", location: "Student Center Ballroom"}
  ],
  arts: [
    {name: "Student Theater: Hamlet", date: "March 28-30", time: "8:00 PM", location: "Arts Center"},
    {name: "Spring Choir Concert", date: "April 15", time: "7:30 PM", location: "Recital Hall"}
  ]
};

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({request, response});
  
  function welcome(agent) {
    agent.add("Hi " + studentData.name + "! I'm your University Assistant. I can help with course information, your class schedule, and campus events. What would you like to know about?");
  }
  
  function courseInformation(agent) {
    const courseCode = agent.parameters.course_code.toUpperCase();
    const course = courseData[courseCode];
    
    if (course) {
      agent.add("Here's information about " + courseCode + ": " + course.description + ". Prerequisites: " + course.prerequisites + ". It's offered in " + course.semesters + ".");
    } else {
      agent.add("I don't have information about " + courseCode + ". Please check the course catalog or try another course code.");
    }
  }
  
  function classSchedule(agent) {
    const day = agent.parameters.day || "today";
    
    // Simple mock logic - not actually filtering by day
    let scheduleText = "Here's your schedule for " + day + ", " + studentData.name + ":\\n";
    
    studentData.courses.forEach(course => {
      scheduleText += "- " + course.code + ": " + course.name + "\\n  " + course.schedule + " in " + course.location + "\\n";
    });
    
    agent.add(scheduleText);
  }
  
  function campusEvents(agent) {
    const eventType = agent.parameters.event_type || "all";
    
    let eventsText = "Here are the upcoming " + eventType + " events:\\n";
    
    if (eventType === "all") {
      // Combine all event types
      Object.keys(eventsData).forEach(type => {
        eventsData[type].forEach(event => {
          eventsText += "- " + event.name + "\\n  " + event.date + " at " + event.time + ", " + event.location + "\\n";
        });
      });
    } else if (eventsData[eventType]) {
      eventsData[eventType].forEach(event => {
          eventsText += "- " + event.name + "\\n  " + event.date + " at " + event.time + ", " + event.location + "\\n";
      });
    } else {
      eventsText = "I don't have information about " + eventType + " events. Try asking about sports, academic, social, or arts events.";
    }
    
    agent.add(eventsText);
  }

  let intentMap = new Map();
  intentMap.set('Welcome', welcome);
  intentMap.set('CourseInformation', courseInformation);
  intentMap.set('ClassSchedule', classSchedule);
  intentMap.set('CampusEvents', campusEvents);
  agent.handleRequest(intentMap);
});