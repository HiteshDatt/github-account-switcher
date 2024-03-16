
const switchGitAccount = async ({ userName, userEmail }) => {

    const credentialRemoved = await window.electron.removeGithubCredential();

    console.log('GitHub credential status:', credentialRemoved);

    const nameSet = await window.electron.setGitConfig('user.name', userName);
    const emailSet = await window.electron.setGitConfig('user.email', userEmail);

    if (nameSet && emailSet) {
        console.log('Git config updated successfully');
    } else {
        console.error('Failed to update Git config.');
        alert('Failed to switch account. Please try again.');
    }
}

const returnCurrentGitUser = async (GIT_ACCOUNTS_LIST_NEW) => {
    const currentGitUserName = await window.electron.checkCurrentGitUser();
    if (currentGitUserName) {
        const currentGitUser = GIT_ACCOUNTS_LIST_NEW.find((item) => {
            return item.userName === currentGitUserName
        });
        return currentGitUser;
    }
}

const setLoading = (loading) => {
    const loader = document.getElementById('loader');

    if (loading) {
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}


document.addEventListener('DOMContentLoaded', async () => {

    const GIT_ACCOUNTS_LIST_NEW = await window.electron.getGitUserList();
    setLoading(false);

    if (GIT_ACCOUNTS_LIST_NEW && GIT_ACCOUNTS_LIST_NEW?.length > 0) {
        const accountChanger = document.getElementById('accountChanger');
        accountChanger.style.display = 'flex';

        const gitAccountsSelect = document.getElementById('gitAccountsSelect');
        const currentGitUser = await returnCurrentGitUser(GIT_ACCOUNTS_LIST_NEW);
        GIT_ACCOUNTS_LIST_NEW.forEach(account => {
            const option = document.createElement('option');
            option.value = account.userName;
            option.text = `${account.nickName} (${account.userName})`;
            if (account.userName === currentGitUser.userName) {
                option.selected = true;
            }
            gitAccountsSelect.appendChild(option);
        });

        gitAccountsSelect.addEventListener('change', (event) => {
            const selectedUserName = event.target.value;
            const selectedAccount = GIT_ACCOUNTS_LIST_NEW.find((item) => {
                return item.userName === selectedUserName
            });
            if (selectedAccount) {
                switchGitAccount({ userName: selectedAccount.userName, userEmail: selectedAccount.userEmail });
            }
        });
    } else {
        const welcome = document.getElementById('welcome');
        welcome.style.display = 'block';

        const addGitUser = document.getElementById('addGitUser');
        addGitUser.addEventListener('click', async () => {
            const inputsContainerNode = document.querySelectorAll('#inputsContainer input');
            const inputsContainer = inputsContainerNode ? [...inputsContainerNode] : null;
            let inputValues = [];
            let obj = {};
            inputsContainer?.forEach((item) => {
                obj[item.name] = item.value;
            });
            inputValues.push(obj);

            const updatedList = await window.electron.addGitUserToList(inputValues);
        })
    }

});