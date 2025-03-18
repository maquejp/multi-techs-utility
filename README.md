# **Multi-Techs Utility**  
> A CLI tool to help users generate projects for different technologies, including **GUIs, backends, and database servers**.

---

## 🚀 **Features**  
✅ Generate projects for **Web, Mobile, Backend, and Database** technologies.  
✅ Supports frameworks like **Angular, React, Vue, Express.js, Spring Boot, and more**.  
✅ Interactive CLI with **guided prompts** for easy setup.  
✅ **Smart defaults** (`Web/Angular`) for quick project creation.  
✅ **Fast & flexible** – use command-line options or interactive mode.  

---

## 📦 **Installation**  
To install this CLI tool globally, run:  
```sh
npm install -g multi-techs-utility
```

---

## 🛠 **Usage**  

### 📌 **1. Create a New Project**  
You can **let the CLI guide you step by step**:  
```sh
multi-techs-utility create
```
📌 **The CLI will ask you:**  
✔ Project name (default: `my-app`)  
✔ Category (default: `web`)  
✔ Technology (default: `angular`)  

#### **Example Interaction:**  
```
$ multi-techs-utility create
? Enter your project name: (my-app)  
? Select a technology category: (Web Technologies (web))  
? Select a technology from Web Technologies: (angular - A platform for building mobile and desktop web applications)  
✔ Creating project "my-app" with Web Technologies:
  ✅ Web Technologies: angular
```

### 📌 **2. Create a Project with Command-line Options**  
If you already know what you want, you can skip the prompts:  
```sh
multi-techs-utility create my-project -c backend -t expressjs
```
✔ This will create a project named `"my-project"` using **Express.js (Backend)**.

### 📌 **3. List Available Technologies**  
```sh
multi-techs-utility list
```
✔ Displays **all supported categories and technologies**.  

#### 🔹 **List only Web Technologies:**  
```sh
multi-techs-utility list web
```

### 📌 **4. Get Information About a Technology**  
```sh
multi-techs-utility info reactjs
```
✔ Displays details, documentation links, and usage for ReactJS.

### 📌 **5. Show CLI Version**  
```sh
multi-techs-utility version
```

### 📌 **6. Get Help**  
```sh
multi-techs-utility help
```
✔ Lists available commands and how to use them.

---

## 🛠 **Supported Technologies**  

### **Web Technologies** 🌐  
- **Angular** 🅰️  
- **ReactJS** ⚛️  
- **Vue.js** 🟩  
- **Svelte** 🟠  
- **Astro** 🚀  

### **Mobile Technologies** 📱  
- **Flutter** 🦋  
- **React Native** 📱  
- **Ionic** ⚡  

### **Backend Technologies** 🖥️  
- **Express.js** 🚀  
- **Spring Boot** ☕  
- **API Platform** 🛠️  

### **Database Technologies** 🗄️  
- **MongoDB** 🍃  
- **PostgreSQL** 🐘  
- **MariaDB** 🏦  
- **Oracle Enterprise** 🏛️  

---

## 💡 **Example Usage Scenarios**  
1️⃣ **Quickly scaffold a new project**  
```sh
multi-techs-utility create my-project
```
2️⃣ **Create a Backend API with Express.js**  
```sh
multi-techs-utility create my-api -c backend -t expressjs
```
3️⃣ **Setup a mobile app with React Native**  
```sh
multi-techs-utility create my-mobile-app -c mobile -t reactnative
```

---

## 🛠 **Development & Contribution**  
To run the CLI locally for development:  
```sh
git clone https://github.com/maquejp/multi-techs-utility.git
cd multi-techs-utility
npm install
node cli.js create
```

👨‍💻 **Want to contribute?** Open an issue or submit a pull request!  

---

## 📜 **License**  
This project is licensed under the **MIT License**.  

---

### 🌟 **Enjoy using Multi-Techs Utility?**  
Give this repo a ⭐ on GitHub to show your support! 🚀  

---

Let me know how I can make this even better for you! 😊