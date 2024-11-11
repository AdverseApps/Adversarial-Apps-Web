# Adversarial Apps Web Application

Created by Conner Harbaugh, James Allen, Christopher Gagnier, Christian Rodriguez, and Oluwadamilol Ogboja.

## About


## Setting Up Local Environment

To setup the local environment you will need a few tools and applications. The installation is a two part process, first let us focus on the Next.js part.

### Installing Required Packages

#### Next.js Installation

To install required packages for next.js to work, first install node. 

Example:

```bash
brew install node
```

Node usually has npm installed with it, but if not make sure to install it as well.

We are using pnpm for this project, so install pnpm as seen below:

```bash
npm install -g pnpm
```

Once you have pnpm installed you will next need to install the local packages.

NOTE: Make sure in the directory for the app, and not the root of the repository so it can reference the package.json file to get the packages needed.

```bash
pnpm install
```

#### Python Installation

This project uses Python 3 for the backend, however all backend scripts are local and no external api is used. This does require having python installed on system 

To install python 3 run:

```bash
brew install python3
```

Once you have python you will also need to install the required packages for the API to work. Run the command below:

```bash
pip install -r requirements.txt
```

### Running the Local Application

Now that all the packages are installed you should be able to run the application at localhost. It usually defaults to port 3000.

Run the following command to launch the application.
NOTE: Must be in the adversarial_apps folder (i.e. the folder of the next.js app) and NOT in the root of the repository when running.

```bash
pnpm run dev
```

This will boot up the application, report any errors, and will update site live as you make changes. It will also tell you where the server is running on allowing you to go to that page to view the application.

## Linting

All the code must be linted to standardize formatting. We use Black & iSort for python files and ESLint for the Next.js component.

ESLint comes provided as part of the required packages for application.
You must use that version of ESLint. When you install the packages as seen above in README you will have ESLint and can run the following command:
```bash
npx eslint "src/**"
```

You can also run
```bash
npm run lint
```

Black and isort are ran as follows
```bash
black adversarial_apps
isort adversarial_apps
```

Essentially just run the two commands and specify the root older of the project afterwards.

You may also isolate it to the specific folder.

## Contributing

To contribute to this application and the process for doing so, please view the [Contribution Guide](.github\CONTRIBUTING.md).

