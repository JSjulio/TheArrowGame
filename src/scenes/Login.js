import { Scene } from "phaser";

export class Login extends Scene {
  constructor() {
    super({ key: "Login" });
  }

  create() {
    // Create text objects for labels
    this.add.text(100, 100, "Username:");
    this.add.text(100, 140, "Password:");

    // Create HTML input elements
    this.usernameInput = this.add.dom(200, 100, "input").setOrigin(0);
    this.passwordInput = this.add.dom(200, 140, "input").setOrigin(0);
    this.passwordInput.node.type = "password";

  // Add CSS styles to the input elements to ensure visibility
  this.usernameInput.node.style.backgroundColor = 'white'; // Background color white for visibility
  this.usernameInput.node.style.opacity = '1';             // Fully opaque
  this.usernameInput.node.style.outline = 'none';          // No outline on focus
  this.usernameInput.node.style.border = '1px solid #000'; // Black border for definition
  this.usernameInput.node.style.zIndex = '1000';           // Ensure the input is above the game canvas

  this.passwordInput.node.style.backgroundColor = 'white';
  this.passwordInput.node.style.opacity = '1';
  this.passwordInput.node.style.outline = 'none';
  this.passwordInput.node.style.border = '1px solid #000';
  this.passwordInput.node.style.zIndex = '1000';

    // Create a login button
    this.loginButton = this.add
      .text(100, 180, "Login", { fill: "#0f0" })
      .setInteractive()
      .on("pointerdown", () => this.login());
  }

  login() {
    const username = this.usernameInput.node.value;
    const password = this.passwordInput.node.value;

    // Clear the input fields
    this.usernameInput.node.value = "";
    this.passwordInput.node.value = "";

    // Send login request to the server
    fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          // Save the token and transition to the next scene
          this.registry.set("userToken", data.token);
          this.scene.start("Game"); // player will be forwarded over to the game scene 
        } else {
          // Handle errors, e.g., show an error message to the user
          this.add.text(100, 220, "Login failed: " + data.error, {
            fill: "#f00",
          });
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        this.add.text(100, 220, "Login failed: " + error.message, {
          fill: "#f00",
        });
      });
  }
  
}
