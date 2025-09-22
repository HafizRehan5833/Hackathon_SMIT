# Backend for SMIT Hackathon Project

This backend is designed for a hackathon project, providing APIs and utilities for student management, analytics, email notifications, and more. The project is organized into several modules, each responsible for a specific functionality.

## Project Structure

```
backend/
│   main.py                # Main entry point for the backend server
│   requirements.txt       # Python dependencies
│   pyproject.toml         # Project metadata and build system
│   vercel.json            # Vercel deployment configuration
│   .env                   # Environment variables (not committed)
│   README.md              # Project documentation
│
├── api/
│   └── main.py            # API endpoints
│
├── data/
│   └── cafeteria.txt      # Cafeteria data
│
├── db/
│   └── db.py              # Database connection and queries
│
├── email_utils/
│   └── email.py           # Email sending utilities
│
├── model/
│   └── model.py           # Machine learning or data models
│
├── routes/
│   ├── analytics.py       # Analytics-related routes
│   ├── student_routes.py  # Student management routes
│   └── user_routes.py     # User management routes
│
├── tools/
│   ├── campus_faq.py      # Campus FAQ tool
│   └── student_tool.py    # Student helper tools
│
└── utils/
    └── auth_utils.py      # Authentication utilities
```

## Key Features

- **API Endpoints**: Organized under `api/` and `routes/` for modularity.
- **Database Layer**: All DB interactions are handled in `db/db.py`.
- **Email Notifications**: Utility functions for sending emails in `email_utils/email.py`.
- **Authentication**: Auth logic in `utils/auth_utils.py`.
- **Analytics**: Analytics endpoints in `routes/analytics.py`.
- **Student & User Management**: Handled in `routes/student_routes.py` and `routes/user_routes.py`.
- **Tools**: Extra utilities for students and campus info in `tools/`.
- **Data**: Static data (e.g., cafeteria info) in `data/`.
- **Model**: Placeholder for ML/data models in `model/model.py`.

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```sh
   pip install -r requirements.txt
   ```
3. **Set up environment variables**:
   - Copy `.env.example` to `.env` and fill in the required values.
4. **Run the backend**:
   ```sh
   python main.py
   ```

## Deployment

- The project includes a `vercel.json` for deployment on Vercel.
- Adjust environment variables and settings as needed for production.

## Notes

- Python version is specified in `.python-version`.
- Compiled files are ignored via `.gitignore`.
- For more details on each module, see the respective Python files.

---

*This README was auto-generated based on the project structure and code organization.*

