import { Scene } from "phaser";
import io from "socket.io-client";

export class AuthScene extends Scene {
  constructor() {
    super("AuthScene");
    this.socket = null; // socket initialization
  }

  create() {
    // Fade in the scene
    this.cameras.main.fadeIn(1000)

    // Initialize the socket
    this.socket = io('http://localhost:3000'); 
    
    this.socket.on('connect', () => {
      console.log("authConsoleLog: socket init!");
  }); 

    const bImage = this.add.image(512, 384, 'loginImage');
    bImage.setAlpha(.6);
    this.createLoginForm();
    this.createRegisterForm();

     const titleText = this.add.text(this.cameras.main.centerX, 50, 'Welcome to The Arrow Game', {
      font: 'Arial',
      fontSize: '90px',
      fill: '#ffffff',
    }).setOrigin(0.5).setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
    .setScale(1.9);

      this.tweens.add({
      targets: titleText,
      alpha: { start: 0.7, to: 1 },
      ease: 'Linear',
      duration: 700,
      repeat: -1,
      yoyo: true
    });
  }
  
  // Login / Registration form
  createForm(type, yPosition) {
    const text = type === 'login' ? 'Login' : 'Register';
    this.add.text(100, yPosition, `${text} Username:`, {fill: '#000'});
    this.add.text(100, yPosition + 40, `${text} Password:`, {fill: '#000'});

    const usernameInput = this.add.dom(300, yPosition, 'input').setOrigin(0);
    const passwordInput = this.add.dom(300, yPosition + 40, 'input', { type: 'password' }, ).setOrigin(0);

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
        console.log(`authConsoleLog: ${data.player.name} ${type} successful!`);
  
        // Fade out effect before switching scenes
        this.cameras.main.fadeOut(1000, 0, 0, 0, (camera, progress) => {
          if (progress === 1) {
            // if auth is successful, proceed to next scene and pass serverUrl, player data, and token to next scene 
            this.scene.start('LobbyScene', { socket: this.socket, player: data.player, playerName: data.player.name});
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