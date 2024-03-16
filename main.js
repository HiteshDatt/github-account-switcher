const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const Store = require('electron-store');

const GIT_TARGET_KEY = "git:https://github.com";

let mainWindow;

const store = new Store();

const GIT_USER_LIST_KEY = "git-user-list"

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false // Ensure Node integration is disabled
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.handle('remove-github-credential', async () => {
    try {
        const credentialExists = await checkGithubCredentialExists();
        if (!credentialExists) {
            console.log('GitHub credential does not exist.');
            return false;
        }

        await executeCommand(`cmdkey /delete:${GIT_TARGET_KEY}`);
        return true;
    } catch (error) {
        console.error('Failed to remove GitHub credential:', error);
        return false;
    }
});

ipcMain.handle('set-git-config', async (event, key, value) => {
    try {
        await executeCommand(`git config --global ${key} "${value}"`);
        return true;
    } catch (error) {
        console.error('Failed to set Git config:', error);
        return false;
    }
});

ipcMain.handle('check-current-git-user', async (event, key, value) => {
    try {
        const currentGitUserName = await executeCommand(`git config user.name"`);
        return currentGitUserName;
    } catch (error) {
        console.error('Failed to set Git config:', error);
        return false;
    }
});

ipcMain.handle('get-git-user-list', async (event, key, value) => {
    try {
        const retrievedUserList = await store.get(GIT_USER_LIST_KEY);
        return retrievedUserList;
    } catch (error) {
        console.error('Failed to set Git config:', error);
        return false;
    }
});

ipcMain.handle('add-git-user-to-list', async (event, newList) => {
    try {
        const retrievedUserList = await store.get(GIT_USER_LIST_KEY) || [];
        const updatedUserList = [...newList, ...retrievedUserList];
        const finalUpdatedUserList = await store.set(GIT_USER_LIST_KEY, updatedUserList);
        return finalUpdatedUserList;
    } catch (error) {
        console.error('Failed to set Git config:', error);
        return false;
    }
});


function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

function checkGithubCredentialExists() {
    return new Promise((resolve, reject) => {
        exec('cmdkey /list', (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.includes(GIT_TARGET_KEY));
            }
        });
    });
}