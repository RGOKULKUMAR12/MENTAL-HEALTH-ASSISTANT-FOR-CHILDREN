# Mindful Kids – Project Flow & User Responsibilities

## How to Run the Project

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

### Steps

1. **Navigate to the project folder**
   ```
   cd c:\Users\user.DESKTOP-O8HT4H1\Desktop\MENTAL-PRO
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start the development server**
   ```
   npm run dev
   ```

4. **Open in browser**
   - Go to: `http://localhost:3000`
   - On first load you will see the Login page

5. **Build for production** (optional)
   ```
   npm run build
   npm run preview
   ```

---

## Project Flow – How It Works

### 1. Parent flow (first)

1. Parent registers at **Sign up** (name, email, password)
2. Parent logs in with email + password
3. Parent goes to **My Children** → **Create child account**
4. Parent creates child with: **Name**, **User ID**, **Password**
5. Parent shares User ID and password with the child

### 2. Child flow

1. Child logs in with **User ID** and **password** (created by parent)
2. Child enters child portal:
   - **My Space** – Welcome and quick links
   - **Check-in** – Grouped questionnaire (separate cards)
   - **Wellness** – Breathing, mindfulness, streak score

### 3. Check-in (child)

- Questions grouped by **separate cards**: Emotional, Behavioral, Cognitive, Social
- Click a card to expand and answer questions for that group
- Likert scale 1–5 (emoji buttons)
- Submit → score and risk level calculated → results sent to parent dashboard

### 4. Wellness (child)

- **Streak score** – Daily login streak (visiting Wellness counts)
- Breathing exercise (balloon breath)
- 5-4-3-2-1 grounding
- Positive habit reminders

### 5. Parent dashboard

- List of children (parent-created accounts)
- Assessment results and risk level per child
- Risk-based recommendations:
  - **Low:** Keep up wellness
  - **Moderate:** Suggest wellness exercises
  - **High:** Appointment booking form

### 6. Admin flow

- Login with email + password (counselor/admin role)
- Aggregated anonymized analytics (no individual child data)

---

## Risk Scoring (no ML)

- **Average score 3.5–5** → Low risk  
- **Average score 2.0–3.4** → Moderate risk  
- **Average score 1.0–1.9** → High risk  

---

## User Responsibilities

### Child

- Log in with User ID and password
- Complete check-ins (grouped by Emotional, Behavioral, Cognitive, Social)
- Use wellness activities
- Build daily streak by visiting Wellness

### Parent

- Register and log in
- Create child accounts (name, User ID, password)
- Share User ID and password securely
- View child results and recommendations
- Use appointment booking for high-risk children
- Suggest wellness exercises for moderate-risk children

### Admin / Counselor

- View aggregated analytics (anonymized)
- Monitor program-level trends
