
# BugBridge

**BugBridge** is a collaborative platform for reporting software bugs, submitting solutions, and engaging in real-time coding sessions to debug issues efficiently, developed as part of **CSCI 5308 - Advanced Topics in Software Development** at Dalhousie University. It enables developers to work together, share insights, and resolve problems faster. This React-based frontend interfaces with our Spring Boot backend to provide a seamless user experience for bug tracking and resolution.

---

## Features

- **User Authentication and Profile Management**: Secure login, signup, and personalized profiles
- **Bug Reporting System**: Submit detailed bug reports with code snippets or file attachments
- **Real-Time Collaboration**: Engage in live coding sessions to debug issues together
- **Solution Management**: Submit, review, and implement bug fixes
- **Advanced Search and Filters**: Find bugs by status, priority, or assignee
- **Code Editor Integration**: Built-in Monaco editor to run code while editing
- **Responsive Design**: Fully optimized for both desktop and mobile devices
- **Email Notifications**: Receive account verification and password reset emails.

---

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM v7
- **Styling**: TailwindCSS
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios
- **Backend**: Java, Spring Boot
- **Authentication**: JWT
- **Database & Storage**: MySql, Firebase

---

## Prerequisites

- **Node.js**: Version 18 or above
- **Java JDK**: Version 17
- **npm/yarn/bun**: For package management
- **MySQL**: Used for database management and storage.

---

## Dependencies

### Frontend Dependencies

### Core Dependencies

- **@monaco-editor/react**: "^4.6.0"
- **axios**: "^1.7.9"
- **cra-template**: "1.2.0"
- **firebase**: "^11.4.0"
- **js-beautify**: "^1.15.3"
- **jwt-decode**: "^4.0.0"
- **lucide-react**: "^0.474.0"
- **react**: "^18.3.1"
- **react-dom**: "^18.3.1"
- **react-icons**: "^5.4.0"
- **react-markdown**: "^9.0.3"
- **react-router-dom**: "^7.1.5"
- **react-scripts**: "5.0.1"
- **web-vitals**: "^4.2.4"

### Development Dependencies

- **postcss**: "^8.5.1"
- **tailwindcss**: "^3.4.17"

### Backend Dependencies

#### Core Dependencies
- **Spring Boot**: 3.3.0
- **Spring Boot Starter Data JPA**: For database interactions.
- **Spring Boot Starter Web**: For building web applications.
- **MySQL Connector/J**: Runtime dependency for MySQL database.
- **Lombok**: For reducing boilerplate code.
- **Spring Boot Starter Mail**: For email functionality.
- **Spring Boot Starter Thymeleaf**: For rendering HTML templates with Thymeleaf.

#### Security & Authentication
- **Spring Boot Starter Security**: For securing the application.
- **Java JWT**: 4.3.0 (Token-based authentication).
- **Spring Security Test**: For testing security layers.

#### Data Mapping
- **MapStruct**: 1.5.5.Final (For code generation for bean mapping).
- **MapStruct Processor**: For generating the mapper implementation code.

#### Testing
- **Spring Boot Starter Test**: For unit and integration testing.
- **Spring Security Test**: For security-specific testing.

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://git.cs.dal.ca/courses/2025-winter/csci-5308/group08
   cd BugBridge/frontend
   ```
#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file with your environment variables: 
   ```
   SERVER_PORT=your_application_port
   PROD_DB_PASSWORD=your_mysql_password
   PROD_DB_URL=your_mysql_db_connection_url
   PROD_DB_USER=your_mysql_username
   ```


3. Run the backend server:
   ```bash
   ./mvnw spring-boot:run
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Create a `.env` file with required environment variables:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8082
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

---

## Project Structure

```bash
group08/
├── frontend/ # React frontend application
├── backend/ # Spring Boot backend application
├── .gitlab-ci.yml # Docker Compose setup
└── README.md # Project documentation
```

---

## Adherence to SOLID

In this project, we have diligently adhered to the SOLID principles to create a robust and maintainable architecture, while also prioritizing high cohesion and low coupling. For instance, the **RunService** system serves as a key example of these principles in action. Each component follows the **Single Responsibility Principle** by having a distinct purpose—for instance, RunService implementations like JavaRunService or JavaScriptRunService are solely responsible for executing code in their respective languages. Our design is **open for extension but closed for modification**, as demonstrated by the RunServiceFactory, which enables support for new languages without altering existing code. The **Liskov Substitution Principle** is upheld since any RunService implementation can be swapped interchangeably without affecting functionality. The RunService interface is concise and purpose-driven, aligning with the **Interface Segregation Principle**, ensuring clients only depend on relevant methods. Additionally, the **Dependency Inversion Principle** is evident as high-level components, such as the factory, rely on the RunService abstraction rather than concrete implementations. Beyond SOLID, our design achieves **high cohesion** and **low coupling** between them, facilitated by interface-based interactions. 

---

## Smell Analysis Report

Link: https://drive.google.com/drive/folders/1Z0E8NlweVXJuQ0adcdsxUYNsmdW24JFJ?usp=drive_link 

## TDD Report

| Service | Test Commit | Implementation Commit
|--------|-------------|----------------------
| SubmitService | 0538c2408140959412e3245ec3dbcc227d474bea : #43 TEST submission service | 6121ec3d4a0d76673779ddab17ed75878d19adb1 : #43 service implementation to save submissions |
| SubmitService | fed901f7caf3e4b2b6d79ec67b201238c2c457cd : #43 TEST for fetching submissions | 23ef567786c004f5d24bf3af8b2bbd9a7eaa9dd5 : #43 and #45 submissions tab and fetch submissions |
| SubmitService | bc4041a5d39c2346919e493aa887ed6ebcfff31b : #44 TEST approval test | 79b5b194cef32a0b0d7490e2b258b9a7e04f382a : #44 approval and notification implementation |
| NotificationService | 5785df8c01c3f386d9b30926617e95fcd4d702f8 : #44 TEST Notifications | 79b5b194cef32a0b0d7490e2b258b9a7e04f382a : #44 approval and notification implementation |
| SubmitService | b0a962ed0d78608071d53ed61aaed4165c3dfde1 : #43 TEST approved submissions | 4b08e8168508b33bad900f06112a23f7b2ffdc82 : #43 solutions implementation |
| UserService | 528ec9d969cc11ab3696914d4f760b4e14183137 : #14 TESTING update users | 821aaa4aa91f0e7c5d3ddf6fe3118cdd2fc675c6 : #14 update username, email and password |
| BugSuggestionService | c26b810decb7fc9ca6d64767b94f02aed39beb40 : #18 TEST StackOverflow Suggestions API | b7f7c7e5120462ddebac1c9fce364c82ef653cec : #18 service implemented |
| SubmitService | 6170dcc5040619bda00be94dbf2898eba3da7b20 : #46 TEST for rejections and submission by creator | c82bced5f961a16f9f007eeba6d245115b7b2fbb : #46 rejection and fetch by creator |


## Code coverage Report

| Module | Line Coverage |
|--------|--------------:|
| BugService | 100% 	 |
| BugSuggestionService |  84% |
| CommentService |  100% |
| DraftService |    100% |
| FileStorageService |             83% |
| JavaRunService |    100% |
| JavaScriptRunService |  100% |
| NotificationService |  100% |
| PasswordResetService |     84% |
| PythonRunService |    100% |
| RegistrationService |    100% |
| RunService |    100% |
| RunServiceFactory |    100% |
| SessionService |    100% |
| SubmitService |    98% |
| UserService |    89% |

## User Scenarios

### For Bug Reporters:
1. Sign up or log in to your account
2. Create a new bug report with detailed description, code snippets, and screenshots
3. Track the status of reported bugs
4. Communicate with developers working on the solution

### For Developers:
1. Browse assigned bugs or search for open issues
2. Engage in real-time debugging sessions
3. Submit solutions with code changes
4. Review and test proposed fixes from other developers
5. Utilise Stack Overflow suggestions for each bug

### For Project Managers:
1. Monitor bug resolution progress
2. Assign bugs to team members
3. Prioritize issues based on severity

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Team Members

- Ritvik Wuyyuru
- Disha Patel
- Dharma Kevadiya
- Mency Christian

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Special thanks to Dalhousie University
- CSCI5308 Course Staff
- Special thanks to all contributors who have helped shape this project
- Inspired by the needs of client teams everywhere to streamline bug tracking and resolution
