// TODO - FIX BUG: input boxes are not showing on Registration or Login Forms
// user has not been created from frontend as a result
// Frontend IS connected to the backend

import { Scene } from "phaser";

export class AuthScene extends Scene {
  constructor() {
    super({ key: "AuthScene" });
  }

  create() {
    // TODO uncomment "this.input.once" function below while debugging to move to the game scene. May require a manual reload of the frontend server
    this.input.once("pointerdown", () => {
      this.scene.start("Game"); // this line allows you to send the user to the following scene you define in quotations
    });
    this.createRegisterForm();
    this.createLoginForm();

  }

  // Registration Form Elements
  createRegisterForm() {
    // Create text objects for labels
    this.add.text(100, 220, "Register Username:");
    this.add.text(100, 260, "Register Password:");

    // Create HTML input elements for username and password
    this.registerUsernameInput = this.add.dom(250, 220, "input").setOrigin(0);
    this.registerPasswordInput = this.add.dom(250, 260, "input").setOrigin(0);
    this.registerPasswordInput.node.type = "password";

    // Create a register button
    this.registerButton = this.add
      .text(100, 300, "Register", { fill: "#0f0" })
      .setInteractive()
      .on("pointerdown", () => this.register());
  }

  // Login form elements
  createLoginForm() {
    // Create text objects for labels
    this.add.text(100, 100, "Login Username:");
    this.add.text(100, 140, "Login Password:");

    // Create HTML input elements for username and password
    this.loginUsernameInput = this.add.dom(250, 100, "input").setOrigin(0);
    this.loginPasswordInput = this.add.dom(250, 140, "input").setOrigin(0);
    this.loginPasswordInput.node.type = "password";

    // Create a login button
    this.loginButton = this.add
      .text(100, 180, "Login", { fill: "#0f0" })
      .setInteractive()
      .on("pointerdown", () => this.login());
  }

  // Register fetch call
  register() {
    const username = this.registerUsernameInput.node.value;
    const password = this.registerPasswordInput.node.value;

    fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, password: password }), // take note that the backend is expected a key of 'name' not 'username'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.player && data.token) {
          // Handle successful registration
          console.log("Registration successful, token:", data.token);
        } else {
          // Handle registration failure
          console.error("Registration failed:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error during registration:", error);
      });
  }

  // Login fetch call
  login() {
    const username = this.loginUsernameInput.node.value;
    const password = this.loginPasswordInput.node.value;

    fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, password: password }), // take note that the backend is expected a key of 'name' not 'username'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          // Handle successful login, e.g., save token, start game scene
          console.log("Login successful, token:", data.token);
        } else {
          // Handle login failure
          console.error("Login failed:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  }
}
