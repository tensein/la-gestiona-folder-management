
Built by https://www.blackbox.ai

---

# La Gestiona

## Project Overview

**La Gestiona** is a web-based application designed to manage folders associated with various administrative tasks. It allows users to add, modify, delete, and track the status of each folder along with the relevant documents. The interface employs the responsive design of Tailwind CSS to provide a seamless user experience across devices.

## Installation

To set up **La Gestiona** locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate into the project directory:
   ```bash
   cd la-gestiona
   ```

3. Open `index.html` in your preferred web browser to view the application.

## Usage

- Open the application in a web browser.
- Use the navigation buttons to switch between different sections:
  - **Ajouter (Add)**: Add new folders and their details.
  - **Dos (List)**: View the list of all folders.
  - **Mod (Modify)**: Modify an existing folder's details.
  - **Sup (Delete)**: Delete a folder.
  - **Eta (States)**: View the current status of different folders.

## Features

- Add folders with details including:
  - Name
  - Arrival date
  - State
  - Associated documents
- Modify existing folders.
- Delete folders from the system.
- Search functionality for quick access to specific folders.
- Print functionalities for generated reports of folder statuses.

## Dependencies

This project relies on the following libraries:

- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Font Awesome](https://fontawesome.com/) for icons

No additional dependencies are specified in `package.json`, as the project does not use a package manager or server-side technology.

## Project Structure

```
la-gestiona/
│
├── index.html                # Main HTML file serving the application interface
├── css/
│   └── style.css             # Custom CSS styles (if any)
└── js/
    └── app.js                # JavaScript file containing application logic
```

### File Descriptions

- **index.html**: The main HTML interface of the application that includes sections for adding, modifying, viewing, and deleting folders.
- **css/style.css**: Where additional custom styles can be added to enhance the application's appearance.
- **js/app.js**: Contains the JavaScript logic that manages the application's functionality and user interactions.

## Contributing

If you wish to contribute to this project, feel free to create an issue or submit a pull request. Your contributions are welcome!

## License

This project is open source and available under the [MIT License](LICENSE).