// Authentication System
const auth = {
        async login(username, password) {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                if (!response.ok) throw new Error('Login failed');
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                return data;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
    
        async register(username, password) {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                if (!response.ok) throw new Error('Registration failed');
                return await response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
    
        async getCurrentUser() {
            const token = localStorage.getItem('authToken');
            if (!token) return null;
            
            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    localStorage.removeItem('authToken');
                    return null;
                }
                return await response.json();
            } catch (error) {
                console.error('Error getting user:', error);
                localStorage.removeItem('authToken');
                return null;
            }
        }
    };
    
    // Cloud Storage Integration
    const cloudStorage = {
        async savePartyData(party) {
            try {
                const user = auth.getCurrentUser();
                if (!user) throw new Error('User not logged in');
                
                const response = await fetch('/api/party', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(party)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save party data');
                }
                return await response.json();
            } catch (error) {
                console.error('Cloud storage error:', error);
                // Fallback to localStorage
                localStorage.setItem('dndPartyData', JSON.stringify(party));
                return party;
            }
        },
    
        async loadPartyData(partyId) {
            try {
                const response = await fetch(`/api/party/${partyId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    const savedData = localStorage.getItem('dndPartyData');
                    if (savedData) {
                        const party = JSON.parse(savedData);
                        if (party.id === partyId) return party;
                    }
                    throw new Error('Party not found');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error loading party:', error);
                const savedData = localStorage.getItem('dndPartyData');
                if (savedData) {
                    const party = JSON.parse(savedData);
                    if (party.id === partyId) return party;
                }
                throw error;
            }
        }
    };
    
    // Transaction History
    const transactionHistory = {
        addTransaction(transaction) {
            if (!party.transactionHistory) {
                party.transactionHistory = [];
            }
            party.transactionHistory.push({
                ...transaction,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            savePartyData(party);
        },
    
        getTransactions(filter = {}) {
            if (!party.transactionHistory) return [];
            return party.transactionHistory.filter(tx => {
                const matches = {};
                Object.entries(filter).forEach(([key, value]) => {
                    matches[key] = tx[key] === value;
                });
                return Object.values(matches).every(Boolean);
            });
        }
    };
    
    // Party Invitation System
    const partyInvites = {
        async sendInvite(partyId, username) {
            try {
                const response = await fetch('/api/party/invite', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ partyId, username })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to send invitation');
                }
                return await response.json();
            } catch (error) {
                console.error('Error sending invitation:', error);
                throw error;
            }
        },
    
        async acceptInvite(inviteId) {
            try {
                const response = await fetch(`/api/party/invite/${inviteId}/accept`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to accept invitation');
                }
                return await response.json();
            } catch (error) {
                console.error('Error accepting invitation:', error);
                throw error;
            }
        }
    };
    
    // Account Customization
    const accountCustomization = {
        async updatePreferences(preferences) {
            try {
                const user = auth.getCurrentUser();
                if (!user) throw new Error('User not logged in');
                
                const response = await fetch('/api/user/preferences', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(preferences)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update preferences');
                }
                return await response.json();
            } catch (error) {
                console.error('Error updating preferences:', error);
                throw error;
            }
        }
    };
    
    // Main Application State
    let party = null;
    let currentTransaction = {};
    
    // Currency Definitions (in copper pieces)
    const CURRENCY_VALUES = {
        pp: 1000, // 1 platinum = 10 gold * 100 copper
        gp: 100,  // 1 gold = 100 copper
        ep: 50,   // 1 electrum = 5 silver * 10 copper
        sp: 10,   // 1 silver = 10 copper
        cp: 1     // Base unit
    };
    
    const CURRENCIES = ['pp', 'gp', 'ep', 'sp', 'cp'];
    
    // Utility Functions
    function fundsToCopper(funds) {
        return CURRENCIES.reduce((total, currency) => {
            return total + (parseInt(funds[currency] || 0) * CURRENCY_VALUES[currency]);
        }, 0);
    }
    
    function copperToFunds(totalCopper) {
        let remainingCopper = totalCopper;
        const newFunds = {};
        for (const currency of CURRENCIES) {
            const value = CURRENCY_VALUES[currency];
            newFunds[currency] = Math.floor(remainingCopper / value);
            remainingCopper %= value;
        }
        return newFunds;
    }
    
    function addFunds(targetFunds, amountToAdd) {
        const currentCopper = fundsToCopper(targetFunds);
        const toAddCopper = fundsToCopper(amountToAdd);
        const newTotalCopper = currentCopper + toAddCopper;
        const newFunds = copperToFunds(newTotalCopper);
        CURRENCIES.forEach(c => targetFunds[c] = newFunds[c]);
    }
    
    function subtractFunds(targetFunds, amountToSubtract) {
        const currentCopper = fundsToCopper(targetFunds);
        const toSubtractCopper = fundsToCopper(amountToSubtract);
        if (currentCopper < toSubtractCopper) {
            return false; // Insufficient funds
        }
        const newTotalCopper = currentCopper - toSubtractCopper;
        const newFunds = copperToFunds(newTotalCopper);
        CURRENCIES.forEach(c => targetFunds[c] = newFunds[c]);
        return true;
    }
    
    // DOM Elements
    const partyNameInput = document.getElementById('partyNameInput');
    const createPartyButton = document.getElementById('createPartyButton');
    const loadedPartyNameDisplay = document.getElementById('loadedPartyName');
    const appArea = document.getElementById('appArea');
    const partySetupSection = document.getElementById('partySetupSection');
    const partyFundsDisplay = document.getElementById('partyFundsDisplay');
    const depositPartyButton = document.getElementById('depositPartyButton');
    const withdrawPartyButton = document.getElementById('withdrawPartyButton');
    const memberNameInput = document.getElementById('memberNameInput');
    const addMemberButton = document.getElementById('addMemberButton');
    const membersList = document.getElementById('membersList');
    const transactionModal = document.getElementById('transactionModal');
    const modalTitle = document.getElementById('modalTitle');
    const transactionForm = document.getElementById('transactionForm');
    const transactionTypeSelect = document.getElementById('transactionType');
    const memberSelectGroup = document.getElementById('memberSelectGroup');
    const memberSelect = document.getElementById('memberSelect');
    const toMemberSelectGroup = document.getElementById('toMemberSelectGroup');
    const toMemberSelect = document.getElementById('toMemberSelect');
    const currencyInputs = transactionForm.querySelectorAll('.currency-inputs input[type="number"]');
    const ppInput = document.getElementById('ppInput');
    const gpInput = document.getElementById('gpInput');
    const epInput = document.getElementById('epInput');
    const spInput = document.getElementById('spInput');
    const cpInput = document.getElementById('cpInput');
    const cancelTransactionButton = document.getElementById('cancelTransactionButton');
    const confirmTransactionButton = document.getElementById('confirmTransactionButton');
    const transactionErrorMessage = document.getElementById('transactionErrorMessage');
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    
    // UI Rendering Functions
    function renderPartyName() {
        if (party && party.name) {
            loadedPartyNameDisplay.querySelector('span').textContent = party.name;
            loadedPartyNameDisplay.classList.remove('hidden');
            partyNameInput.value = party.name;
            appArea.classList.remove('hidden');
            partySetupSection.querySelector('h2').textContent = "Party Overview";
            createPartyButton.textContent = "Switch/Rename Party";
        } else {
            loadedPartyNameDisplay.classList.add('hidden');
            appArea.classList.add('hidden');
            partySetupSection.querySelector('h2').textContent = "Party Setup";
            createPartyButton.textContent = "Create/Load Party";
        }
    }
    
    function renderPartyTreasury() {
        if (!party) return;
        partyFundsDisplay.innerHTML = '';
        CURRENCIES.forEach(currency => {
            const amount = party.treasury[currency] || 0;
            const fundDiv = document.createElement('div');
            fundDiv.className = 'p-3 bg-surfaceContent rounded-lg shadow';
            fundDiv.innerHTML = `
                <div class="text-xs text-textSecondary uppercase">${currency.toUpperCase()}</div>
                <div class="text-2xl font-bold text-secondary">${amount}</div>
            `;
            partyFundsDisplay.appendChild(fundDiv);
        });
    }
    
    function renderMembersList() {
        if (!party) return;
        membersList.innerHTML = '';
        if (party.members.length === 0) {
            membersList.innerHTML = `<p class="text-center text-textSecondary italic">No members added yet. Add one above!</p>`;
            return;
        }
        party.members.forEach((member, index) => {
            const memberCard = document.createElement('div');
            memberCard.className = 'p-4 bg-surfaceContent rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4';
            memberCard.innerHTML = `
                <div>
                    <h4 class="text-xl font-semibold text-primary-light mb-1">${member.name}</h4>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-textSecondary">
                        ${CURRENCIES.map(c => `<span>${c.toUpperCase()}: <strong class="text-textPrimary">${member.funds[c] || 0}</strong></span>`).join('')}
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <button data-member-index="${index}" class="action-button member-deposit-button w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">Deposit</button>
                    <button data-member-index="${index}" class="action-button member-withdraw-button w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">Withdraw</button>
                    <button data-member-index="${index}" class="action-button member-transfer-button w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">Transfer</button>
                    <button data-member-index="${index}" class="action-button member-remove-button w-full sm:w-auto bg-danger hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">Remove</button>
                </div>
            `;
            membersList.appendChild(memberCard);
        });
    }
    
    function renderTransactionHistory() {
        const historySection = document.getElementById('transactionHistory');
        if (!party || !party.transactionHistory) {
            historySection.innerHTML = '<p class="text-center text-textSecondary italic">No transactions yet.</p>';
            return;
        }
    
        historySection.innerHTML = `
            <div class="space-y-4">
                ${party.transactionHistory.map(tx => `
                    <div class="p-4 bg-surfaceContent rounded-lg shadow">
                        <div class="text-sm text-textSecondary">${new Date(tx.timestamp).toLocaleString()}</div>
                        <div class="font-medium">${tx.type}</div>
                        <div class="text-sm text-textSecondary">
                            ${tx.from ? `From: ${tx.from}` : ''}
                            ${tx.to ? `To: ${tx.to}` : ''}
                            ${tx.amount ? `Amount: ${tx.amount.pp}pp ${tx.amount.gp}gp ${tx.amount.ep}ep ${tx.amount.sp}sp ${tx.amount.cp}cp` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Transaction Modal Logic
    function openTransactionModal(type, memberIndex = null) {
        currentTransaction = { type, memberIndex };
        transactionForm.reset();
        transactionErrorMessage.classList.add('hidden');
        transactionErrorMessage.textContent = '';
        
        memberSelectGroup.classList.add('hidden');
        toMemberSelectGroup.classList.add('hidden');
        
        switch (type) {
            case 'party_deposit':
                modalTitle.textContent = 'Deposit to Party Treasury';
                break;
            case 'party_withdraw':
                modalTitle.textContent = 'Withdraw from Party Treasury';
                memberSelectGroup.classList.remove('hidden');
                populateMemberSelect(memberSelect);
                transactionTypeSelect.innerHTML = `<option value="party_withdraw" selected>Party to Member</option>`;
                break;
            case 'member_deposit':
                modalTitle.textContent = `Deposit to ${party.members[memberIndex].name}`;
                transactionTypeSelect.innerHTML = `<option value="member_deposit" selected>Party to ${party.members[memberIndex].name}</option>`;
                break;
            case 'member_withdraw':
                modalTitle.textContent = `Withdraw from ${party.members[memberIndex].name}`;
                transactionTypeSelect.innerHTML = `<option value="member_withdraw" selected>${party.members[memberIndex].name} to Party</option>`;
                break;
            case 'member_to_member':
                modalTitle.textContent = `Transfer from ${party.members[memberIndex].name}`;
                toMemberSelectGroup.classList.remove('hidden');
                populateMemberSelect(toMemberSelect, memberIndex);
                transactionTypeSelect.innerHTML = `<option value="member_to_member" selected>${party.members[memberIndex].name} to Another Member</option>`;
                break;
        }
        
        transactionModal.classList.remove('hidden');
        setTimeout(() => {
            transactionModal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
            transactionModal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
        }, 10);
    }
    
    function closeTransactionModal() {
        transactionModal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
        transactionModal.querySelector('.modal-content').classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            transactionModal.classList.add('hidden');
        }, 250);
    }
    
    function handleTransactionSubmit(event) {
        event.preventDefault();
        const { type, memberIndex } = currentTransaction;
        const transactionAmount = {};
        let totalTransactionCopper = 0;
        
        currencyInputs.forEach(input => {
            const value = parseInt(input.value) || 0;
            if (value < 0) {
                transactionErrorMessage.textContent = 'Currency amounts cannot be negative.';
                transactionErrorMessage.classList.remove('hidden');
                return;
            }
            transactionAmount[input.name] = value;
            totalTransactionCopper += value * CURRENCY_VALUES[input.name];
        });
        
        if (totalTransactionCopper === 0) {
            transactionErrorMessage.textContent = 'Please enter an amount to transfer.';
            transactionErrorMessage.classList.remove('hidden');
            return;
        }
        
        transactionErrorMessage.classList.add('hidden');
        let success = false;
        let message = '';
        
        try {
            switch (type) {
                case 'party_deposit':
                    addFunds(party.treasury, transactionAmount);
                    success = true;
                    message = 'Funds deposited to party treasury.';
                    break;
                case 'party_withdraw':
                    const targetMemberIndex = parseInt(memberSelect.value);
                    if (isNaN(targetMemberIndex) || targetMemberIndex < 0 || targetMemberIndex >= party.members.length) {
                        throw new Error("Invalid member selected for withdrawal.");
                    }
                    const memberToReceive = party.members[targetMemberIndex];
                    if (subtractFunds(party.treasury, transactionAmount)) {
                        addFunds(memberToReceive.funds, transactionAmount);
                        success = true;
                        message = `Funds withdrawn to ${memberToReceive.name}.`;
                    } else {
                        throw new Error("Insufficient funds in party treasury.");
                    }
                    break;
                case 'member_deposit':
                    const memberReceiving = party.members[memberIndex];
                    if (subtractFunds(party.treasury, transactionAmount)) {
                        addFunds(memberReceiving.funds, transactionAmount);
                        success = true;
                        message = `Funds deposited to ${memberReceiving.name} from party treasury.`;
                    } else {
                        throw new Error("Insufficient funds in party treasury.");
                    }
                    break;
                case 'member_withdraw':
                    const memberGiving = party.members[memberIndex];
                    if (subtractFunds(memberGiving.funds, transactionAmount)) {
                        addFunds(party.treasury, transactionAmount);
                        success = true;
                        message = `Funds withdrawn from ${memberGiving.name} to party treasury.`;
                    } else {
                        throw new Error(`Insufficient funds in ${memberGiving.name}'s wallet.`);
                    }
                    break;
                case 'member_to_member':
                    const fromMember = party.members[memberIndex];
                    const toMemberIdx = parseInt(toMemberSelect.value);
                    if (isNaN(toMemberIdx) || toMemberIdx < 0 || toMemberIdx >= party.members.length || toMemberIdx === memberIndex) {
                        throw new Error("Invalid recipient member selected for transfer.");
                    }
                    const toMember = party.members[toMemberIdx];
                    if (subtractFunds(fromMember.funds, transactionAmount)) {
                        addFunds(toMember.funds, transactionAmount);
                        success = true;
                        message = `Funds transferred from ${fromMember.name} to ${toMember.name}.`;
                    } else {
                        throw new Error(`Insufficient funds in ${fromMember.name}'s wallet.`);
                    }
                    break;
            }
            
            if (success) {
                transactionHistory.addTransaction({
                    type: type,
                    from: type.includes('member') ? party.members[memberIndex].name : 'Party Treasury',
                    to: type.includes('member') ? (type === 'member_to_member' ? party.members[toMemberIdx].name : 'Party Treasury') : party.members[memberIndex].name,
                    amount: transactionAmount
                });
                
                cloudStorage.savePartyData(party);
                renderAll();
                closeTransactionModal();
                showMessage(message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            transactionErrorMessage.textContent = error.message;
            transactionErrorMessage.classList.remove('hidden');
        }
    }
    
    // Event Handlers
    function handleCreateOrLoadParty() {
        const name = partyNameInput.value.trim();
        if (!name) {
            showMessage("Please enter a party name.", true);
            partyNameInput.focus();
            return;
        }
        
        auth.getCurrentUser().then(user => {
            if (user) {
                cloudStorage.loadPartyData(name).then(data => {
                    if (data) {
                        party = data;
                        showMessage(`Loaded existing party: ${party.name}.`);
                    } else {
                        party = {
                            id: name,
                            name: name,
                            treasury: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
                            members: [],
                            transactionHistory: [],
                            owner: user.id
                        };
                        showMessage(`Party "${name}" created! Add members and manage funds.`);
                    }
                    renderAll();
                }).catch(error => {
                    console.error('Error loading party:', error);
                    party = {
                        id: name,
                        name: name,
                        treasury: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
                        members: [],
                        transactionHistory: [],
                        owner: user.id
                    };
                    showMessage(`Party "${name}" created! Add members and manage funds.`);
                    renderAll();
                });
            } else {
                showMessage("Please log in to create or load a party.", true);
            }
        });
    }
    
    function handleAddMember() {
        if (!party) {
            showMessage("Create or load a party first!", true);
            return;
        }
        const memberName = memberNameInput.value.trim();
        if (!memberName) {
            showMessage("Please enter a member name.", true);
            memberNameInput.focus();
            return;
        }
        if (party.members.find(m => m.name.toLowerCase() === memberName.toLowerCase())) {
            showMessage(`Member "${memberName}" already exists.`, true);
            return;
        }
        
        party.members.push({
            name: memberName,
            funds: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
        });
        memberNameInput.value = '';
        cloudStorage.savePartyData(party);
        renderMembersList();
        showMessage(`Member "${memberName}" added.`);
    }
    
    function handleRemoveMember(event) {
        const memberIndex = parseInt(event.target.dataset.memberIndex);
        const member = party.members[memberIndex];
        if (confirm(`Are you sure you want to remove ${member.name}? Their funds will be lost if not transferred first.`)) {
            party.members.splice(memberIndex, 1);
            cloudStorage.savePartyData(party);
            renderMembersList();
            showMessage(`${member.name} removed from the party.`);
        }
    }
    
    function handleMemberTransaction(event, type) {
        const memberIndex = parseInt(event.target.dataset.memberIndex);
        openTransactionModal(type, memberIndex);
    }
    
    // Initialization and Rendering
    function renderAll() {
        if (party) {
            renderPartyName();
            renderPartyTreasury();
            renderMembersList();
            renderTransactionHistory();
        } else {
            appArea.classList.add('hidden');
            partySetupSection.classList.remove('hidden');
            loadedPartyNameDisplay.classList.add('hidden');
        }
    }
    
    function init() {
        auth.getCurrentUser().then(user => {
            if (user) {
                cloudStorage.loadPartyData(user.lastPartyId).then(data => {
                    if (data) {
                        party = data;
                        showMessage(`Welcome back! Loaded party: ${party.name}.`);
                        renderAll();
                    } else {
                        party = null;
                        showMessage("Create a new party or type an existing party name to load.", false);
                        renderAll();
                    }
                }).catch(error => {
                    console.error('Error loading party:', error);
                    party = null;
                    showMessage("Create a new party or type an existing party name to load.", false);
                    renderAll();
                });
            } else {
                party = null;
                showMessage("Please log in to continue.", true);
                renderAll();
            }
        });
        
        createPartyButton.addEventListener('click', handleCreateOrLoadParty);
        addMemberButton.addEventListener('click', handleAddMember);
        depositPartyButton.addEventListener('click', () => openTransactionModal('party_deposit'));
        withdrawPartyButton.addEventListener('click', () => openTransactionModal('party_withdraw'));
        transactionForm.addEventListener('submit', handleTransactionSubmit);
        cancelTransactionButton.addEventListener('click', closeTransactionModal);
        
        transactionModal.addEventListener('click', (e) => {
            if (e.target === transactionModal) {
                closeTransactionModal();
            }
        });
    }
    
    // Start the application
    init();