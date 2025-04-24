# ✨Contribute 101
A simple project aimed to help new developers make their first open source contribution.

[![Tests](https://github.com/rocktimsaikia/contribute-101/actions/workflows/tests.yml/badge.svg)](https://github.com/rocktimsaikia/contribute-101/actions/workflows/tests.yml) [![Netlify Status](https://api.netlify.com/api/v1/badges/2ae6b909-8e96-43dd-97a4-f177fe451d97/deploy-status)](https://app.netlify.com/sites/contribute-101/deploys)

![image](https://github.com/user-attachments/assets/9f9156d8-e34f-4abf-b23b-48b4a1c1457a)

> [!IMPORTANT]
> Please keep in mind that pull requests on this project won't count towards Hacktoberfest. \
> This project is just to help and encourage new developers to get familiar with open source contribution.

## GOAL
- [ ] Make an successful Open Source contribution.
- [ ] Get familiar with GitHub and Git workflow.
- [ ] Make a proper PR (Pull Request) and get it accepted and merged by the project maintainer (@rocktimsaikia)

## STEPS

### 1. Fork and Clone the repository

Fork the repository first and then run the below command after forking the repository. \
And replace `<YOUR_GITHUB_USERNAME>` with your GitHub username. \
This will clone the repository to your local machine.

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/contribute-101.git
```

### 2. Setup local branch 
You can name it anything you want. Here we are calling it `my-card`.

```bash
# Create a new branch
git checkout -b "my-card"

# Install all requried dependencies
npm install
```

### 3. Make the required changes
Now go to `src/contributors.js` file and add your details at the end of the file. \
Please make sure to fill all the fields. Else the pull request will not be accepted.

### 4. Format your code.
Run these two command to format and fix the code. \
It will automatically fix the lint errors if any.

```bash
npm run lint:fix
npm run format:fix
```

### 5. Push your new changess

```bash
# Add all the changes
git add .

# Commit your changes with a message
git commit -m "Add YOURNAME's card"

# Push your changes to your fork
git push -u origin myCard
```

### 6. Now create the pull request. Figure this one out yourself 👏

> [!NOTE]
> Once you created the PR. It will be reviewed by the project maintainer. Now wait for the PR to be accepted.

