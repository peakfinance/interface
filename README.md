The following is Chainstarters' Metis Base React App. The purpose of this app is provide a 
React app that comes equipped with some of the API / UI necessary for developing 
a Metis Dapp on the Chainstarters Platform based on the Open Zeppelin ERC20 Standard using Magic Link for authentication 
and MetaMask for the wallet.

This app was built on [Create React App](https://github.com/facebook/create-react-app).

# Getting started
The following instructions suppose that you have an account on the Chainstarters Platform and have cloned down this repository

1. To start, navigate to your dashboard by [logging in](https://console.chainstarters.com/login)
or [signing up](https://console.chainstarters.com/signup).
2. Then navigate to your project credentials by selecting your project from the dashboard, setting
your desired environment at the top of the screen (`DEV` or `PROD`) and then
navigate to Variables --> View Credentials. Copy these credentials.
3. Create a directory in your root called `.creds.dev` or `.creds.prod`, according to the environment you set
in the dashboard when you copied credentials.
4. Run `yarn` in your root direction from a terminal
5. Once all the packages are done installing, run `yarn start:dev` or `yarn start:prod` in your terminal.
This allows you to test locally. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
This page also reloads if you make any edits. You will also see any lint errors in the console.

## Available Scripts

In the project directory, you can run:
### `yarn start:dev`
### `yarn start:prod`

Launches the app using either dev or prod credentials.

### `yarn build:dev`
### `yarn build:prod`

Builds the app for production to the `build` folder using either dev or prod credentials.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `yarn deploy:dev`
### `yarn deploy:prod`

Build and tag a commit for deployment. This will auto increment version and trigger a Chainstarters pipeline deploying your app live using either dev or prod credentials!

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
To learn React, check out the [React documentation](https://reactjs.org/).
To learn more about Metis check out their [documentation](https://docs.metis.io)
To learn about the ERC20 standard check out the Open Zeppelin [documentation](https://openzeppelin.com/contracts/)
To find out about how Magic Link can be used for authentication, check out this [link](https://magic.link/docs)
For any Chainstarters platform related information, visit the [docs](https://docs.chainstarters.com/docs)