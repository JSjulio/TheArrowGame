import { Scene } from "phaser";

export class AuthScene extends Scene {
  constructor() {
    super({ key: "AuthScene" });
  }

  create(data) {

    this.serverUrl = data.serverUrl; // recieved from MainMenu

    const bImage = this.add.image(512, 384, 'loginImage');
    bImage.setAlpha(.6);
    this.createLoginForm();
    this.createRegisterForm();
  }

  // Unified form creation for login and registration
  createForm(type, yPosition) {
    const text = type === 'login' ? 'Login' : 'Register';
    this.add.text(100, yPosition, `${text} Username:`, {fill: '#000'});
    this.add.text(100, yPosition + 40, `${text} Password:`, {fill: '#000'});

    // input fields for login/registration
    const usernameInput = this.add.dom(300, yPosition, 'input').setOrigin(0);
    const passwordInput = this.add.dom(300, yPosition + 40, 'input', { type: 'password' }, ).setOrigin(0);

    // action button for login/registration
    const actionButton = this.add.text(100, yPosition + 80, text, { fill: '#0f0', backgroundColor: '#000', padding: 10})
      .setInteractive()
      .on('pointerdown', () => {
        const username = usernameInput.node.value;
        const password = passwordInput.node.value;
        this.handleAuth(username, password, type);
      });

    return { usernameInput, passwordInput, actionButton };
  }

  // Create login form
  createLoginForm() {
    this.loginElements = this.createForm('login', 100);
  }

  // Create registration form
  createRegisterForm() {
    this.registerElements = this.createForm('register', 220);
  }

  // Handle authentication (login/register)
  handleAuth(username, password, type) {
    const path = type === 'login' ? '/auth/login' : '/auth/register';
    fetch(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, password: password }),
    })
    .then(response => response.json())
    .then(data => { 
      if (data.token) {
        // Handle successful authentication
        console.log(`${type} successful, token:`, data.token);
        console.log('player: ', data.player.name + ' has logged in !');

        // if auth is successful, proceed to next scene and pass serverUrl, player data, and token to next scene 
        this.scene.start('LobbyScene', { serverUrl: this.serverUrl, player: data.player, token: data.token });
      } else {
      // Handle authentication failure
      console.error(`${type} failed:`, data.error);
    }
    })
    .catch(error => {
      console.error(`Error during ${type}:`, error);
    });
  }
}
// 