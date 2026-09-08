# Clinic Management System

A full-stack **Clinic Management System** built using **Django, Django REST Framework, React.js, and MySQL**.  
The application manages core clinic workflows through role-based modules for **Receptionist, Doctor, Pharmacy, Laboratory, and Accounts**.

## Features

### Receptionist
- Patient registration and management
- Appointment scheduling and token handling
- Doctor and department selection
- Patient and appointment record management

### Doctor
- View assigned appointments
- Record consultation details
- Add symptoms, diagnosis, and notes
- Prescribe medicines
- Prescribe laboratory tests

### Pharmacy
- Medicine inventory management
- View medicine prescriptions
- Issue prescribed medicines
- Track stock and medicine availability

### Laboratory
- Manage laboratory tests
- View lab prescriptions
- Record and manage test results
- Handle laboratory billing workflows

### Accounts
- Staff and department management
- Role-based staff information
- Administrative support for clinic operations

## Tech Stack

### Backend
- Python
- Django 5.2
- Django REST Framework
- Simple JWT
- MySQL
- django-cors-headers
- python-dotenv

### Frontend
- React.js
- Vite
- JavaScript
- REST API integration

### Development Tools
- Git
- GitHub
- VS Code
- MySQL Workbench
- Postman

## Project Structure

```text
clinic-management-system/
│
├── accounts/            # Staff, departments and account-related functionality
├── doctor/              # Consultations and prescriptions
├── laboratory/          # Lab tests, results and billing
├── pharmacy/            # Medicine and pharmacy workflows
├── receptionist/        # Patients and appointments
├── clinic_project/      # Django project configuration
├── frontend/            # React frontend
├── manage.py
├── requirements.txt
└── README.md
```

## Architecture

```text
React Frontend
      |
      | REST API
      v
Django REST Framework
      |
      | Django ORM
      v
MySQL Database
```

The frontend communicates with the Django backend through REST APIs. Django REST Framework handles API endpoints and business logic, while MySQL stores application data.

## Authentication

The backend uses **JWT authentication** through `djangorestframework-simplejwt`.

- Access token lifetime: 30 minutes
- Refresh token lifetime: 1 day

Authenticated requests can send the token using:

```http
Authorization: Bearer <access_token>
```

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/roshinsthomas/clinic-management-system.git
cd clinic-management-system
```

### 2. Create a virtual environment

```bash
python -m venv myvenv
```

Activate it on Windows:

```bash
myvenv\Scripts\activate
```

On Linux/macOS:

```bash
source myvenv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Create a MySQL database

```sql
CREATE DATABASE cms_db;
```

### 5. Create a `.env` file

Create a `.env` file in the project root:

```env
DB_NAME=cms_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
```

Update the values according to your local MySQL configuration.

### 6. Apply migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Run the Django backend

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The React frontend will normally run at:

```text
http://localhost:5173/
```

## Main Modules

| Module | Main Responsibility |
|---|---|
| Receptionist | Patient registration and appointment management |
| Doctor | Consultations, medicine prescriptions and lab prescriptions |
| Pharmacy | Medicine inventory and prescription dispensing |
| Laboratory | Lab tests, results and billing |
| Accounts | Staff, departments and account-related administration |

## Database

The project uses **MySQL** as the relational database and Django ORM for database operations.

Major entities include:

- Users and Staff
- Departments
- Patients
- Appointments
- Consultations
- Medicine Prescriptions
- Lab Prescriptions
- Medicines
- Lab Tests
- Lab Results
- Billing-related records

## API Development

The backend is built with Django REST Framework and supports REST-based communication between the frontend and backend.

The project includes functionality for:

- CRUD operations
- Authentication
- Patient management
- Appointment management
- Consultation management
- Prescription workflows
- Pharmacy workflows
- Laboratory workflows
- Staff and department management

## Version Control

The project was developed using **Git and GitHub** with a branch-based workflow. Development history is maintained through more than 100 commits across the repository.

Repository:

https://github.com/roshinsthomas/clinic-management-system

## Team Project

This project was developed collaboratively as part of structured training at **Faith Infotech, Technopark, Thiruvananthapuram**.

The system was divided into multiple functional modules so team members could work independently using Git branches and later integrate their work into the main application.

## Future Improvements

Possible future enhancements include:

- Production deployment
- Automated API and frontend testing
- Improved reporting and analytics
- Appointment notifications
- Enhanced audit logging
- Fine-grained permissions
- Docker-based deployment

## Author

**Roshin Shibu Thomas**

- GitHub: https://github.com/roshinsthomas
- LinkedIn: https://www.linkedin.com/in/roshinsthomas

## License

This project is intended for educational and portfolio purposes.
