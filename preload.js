const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    removeGithubCredential: async () => {
        return await ipcRenderer.invoke('remove-github-credential');
    },
    setGitConfig: async (key, value) => {
        return await ipcRenderer.invoke('set-git-config', key, value);
    },
    checkCurrentGitUser: async (key, value) => {
        return await ipcRenderer.invoke('check-current-git-user', key, value);
    },
    getGitUserList: async (key, value) => {
        return await ipcRenderer.invoke('get-git-user-list', key, value);
    },
    addGitUserToList: async (newList) => {
        return await ipcRenderer.invoke('add-git-user-to-list', newList);
    }
});
