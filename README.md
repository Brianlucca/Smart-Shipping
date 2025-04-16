# Smart Shipping Frontend
Smart Shipping is a frontend web application that allows users to upload files through a session-based system and generate a QR code for instant sharing. Files are temporarily stored and can be accessed via a session-specific URL.

⚠️ Files are automatically deleted after 5 minutes. This project is for educational and portfolio purposes only.

### Features
📦 Drag-and-drop or manual file selection

🔐 Session-based access with unique QR code

🔁 Refresh session to generate a new URL

⏳ Files expire after 5 minutes

📁 Supports multiple file types (max 20MB per file)

🌐 Seamless integration with the <a href="https://github.com/Brianlucca/Smart-Shipping-BackEnd">Smart Shipping Backend</a>

### Requirements
Node.js (v16+ recommended)

npm or yarn

### Installation

Clone the repository:
```
https://github.com/Brianlucca/Smart-Shipping.git
````
Install dependencies:
```
npm install
# or
yarn
````
Start the development server
```
npm run dev
# or
yarn dev
````
### Environment Setup
The application automatically detects the backend environment based on your local hostname.

``` js
const determineBackendUrl = () => {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:3000';
  }
  return 'https://smart-shipping.onrender.com';
};
````
You don’t need to manually configure the backend URL — it switches automatically between local and production.
Change only the last return to put the IP of your back end in production.


### Usage

Launch the frontend locally.

It will fetch a unique session URL from the backend.

You can drag files into the drop zone or use the file picker.

A QR code is generated for the current session.

Anyone with the session URL or QR can upload/download files (within 5 minutes).

### Project Purpose

This project is built for educational and portfolio purposes to demonstrate:

Secure file handling with sessions

QR code generation

Cloudinary integration (via backend)

UX-focused design with React and TailwindCSS

### Acknowledgments

Built with <a href="https://react.dev/"> React</a> + <a href="https://v3.tailwindcss.com/">Tailwind CSS</a>

QR Code: <a href="https://www.npmjs.com/package/qrcode.react">qrcode.react</a>

Icons: <a href="https://lucide.dev/">Lucide</a>

Toasts: <a href="https://www.npmjs.com/package/react-toastify">react-toastify</a>