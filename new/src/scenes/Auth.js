import { Scene } from "phaser";
import io from "socket.io-client";

export class AuthScene extends Scene {
  constructor() {
    super("AuthScene");
    this.socket = null; 

  }

  create() {

    this.cameras.main.fadeIn(1000)
    this.socket = io('http://localhost:3000'); // recieved from MainMenu
    this.socket.on('connect', () => {
      console.log("consoleLog: You've connected to rootSocket within the Auth scene");
  }); 


    const bImage = this.add.image(512, 384, 'loginImage');
    bImage.setAlpha(.6);
    this.createLoginForm();
    this.createRegisterForm();

     // Cool text effect for the scene title
     const titleText = this.add.text(this.cameras.main.centerX, 50, 'Welcome to The Arrow Game', {
      font: 'Arial',
      fontSize: 48,
      fill: '#ffffff',
    }).setOrigin(0.5).setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    // Adding flicker effect to the title text
    this.tweens.add({
      targets: titleText,
      alpha: { start: 0.7, to: 1 },
      ease: 'Linear',
      duration: 700,
      repeat: -1,
      yoyo: true
    });
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
    const actionButton = this.add.text(100, yPosition + 80, text, { fill: '#0f0', backgroundColor: '#000', padding: 8})
      .setInteractive()
      .on('pointerover', () => {
        this.tweens.add({
          targets: actionButton,
          alpha: { start: 0.7, to: 1 },
          ease: 'Linear',
          duration: 300,
          repeat: -1,
          yoyo: true
        })})
      .on('pointerdown', () => {
        const username = usernameInput.node.value;
        const password = passwordInput.node.value;
        this.handleAuth(username, password, type);
        actionButton.setAlpha(0.5);

    
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
        console.log(`${data.player.name} ${type} successful, your token is:`, data.token);
  
        // Fade out effect before switching scenes
        this.cameras.main.fadeOut(1000, 0, 0, 0, (camera, progress) => {
          if (progress === 1) {
            // if auth is successful, proceed to next scene and pass serverUrl, player data, and token to next scene 
            this.scene.start('LobbyScene', { socket: this.socket, player: data.player, token: data.token });
          }
        });
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