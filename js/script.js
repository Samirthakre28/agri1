document.addEventListener('DOMContentLoaded', () => {
    console.log('AgriContract Full-Stack System Initialized');

    // --- Authentication Engine ---
    const auth = {
        signup: async (name, contact, password, role) => {
            try {
                const { data, error } = await supabase.from('users').insert([
                    { name, contact, password, role }
                ]).select();
                if (error) { throw error; }
                if (data && data.length > 0) {
                    return { success: true, user: data[0] };
                }
                return { success: false, message: 'Signup failed.' };
            } catch (err) { return { success: false, message: err.message }; }
        },
        login: async (contact, password) => {
            try {
                const { data, error } = await supabase.from('users')
                    .select('*')
                    .eq('contact', contact)
                    .eq('password', password);
                if (error) throw error;
                if (data && data.length > 0) {
                    const user = data[0];
                    localStorage.setItem('agri_session', JSON.stringify(user));
                    localStorage.setItem('agri_token', 'supabase-active');
                    return { success: true, user };
                } else {
                    return { success: false, message: 'Invalid credentials.' };
                }
            } catch (err) { 
                alert("Database Connection Failed: " + err.message);
                return { success: false, message: 'Server connection failed.' }; 
            }
        },
        logout: () => {
            localStorage.removeItem('agri_session');
            localStorage.removeItem('agri_token');
            window.location.href = 'index.html';
        },
        getSession: () => JSON.parse(localStorage.getItem('agri_session')),
        checkPageAccess: () => {
            const session = auth.getSession();
            const path = window.location.pathname;
            
            if (path.endsWith('/') || path.includes('index.html') || path.includes('auth.html')) {
                if (session && path.includes('auth.html')) {
                    window.location.href = session.role === 'Buyer' ? 'buyer.html' : 'seller.html';
                }
                return;
            }
            if (!session) {
                window.location.href = 'auth.html';
                return;
            }
            if (path.includes('seller.html') && session.role !== 'Seller') window.location.href = 'buyer.html';
            if (path.includes('buyer.html') && session.role !== 'Buyer') window.location.href = 'seller.html';
        }
    };

    auth.checkPageAccess();
    const session = auth.getSession();

    // --- API Service Objects ---
    const cropsApi = {
        addCrop: async (data) => {
            try {
                const { error } = await supabase.from('crops').insert([
                    { ...data, status: 'Available', farmerName: session.name }
                ]);
                if (error) throw error;
                return { success: true };
            } catch (err) {
                alert("Failed to insert crop: " + err.message);
                return { success: false };
            }
        },
        getMyCrops: async () => {
            try {
                const { data, error } = await supabase.from('crops').select('*').eq('farmerName', session.name);
                if (error) throw error;
                return data || [];
            } catch (err) { 
                alert("Failed to fetch crops: " + err.message);
                return []; 
            }
        },
        getAllAvailable: async () => {
            try {
                const { data, error } = await supabase.from('crops').select('*').eq('status', 'Available');
                if (error) throw error;
                return data || [];
            } catch (err) {
                alert("Failed to fetch market: " + err.message);
                return [];
            }
        }
    };

    const offersApi = {
        sendOffer: async (data) => {
            try {
                const { error } = await supabase.from('offers').insert([
                    { ...data, status: 'Pending', buyerName: session.name }
                ]);
                if (error) throw error;
                return { message: "Offer sent successfully!" };
            } catch(err) {
                alert("Failed to send offer: " + err.message);
                return { message: "Database Error." };
            }
        },
        getMyOffers: async () => {
            try {
                if (session.role === 'Seller') {
                    // Try to fetch my crops first to match offers
                    const myCrops = await cropsApi.getMyCrops();
                    const cropIds = myCrops.map(c => c.id);
                    if (cropIds.length === 0) return [];
                    const { data: offersData, error } = await supabase.from('offers').select('*').in('cropId', cropIds);
                    if (error) throw error;
                    if (!offersData) return [];
                    return offersData.map(o => ({
                        ...o,
                        cropId: myCrops.find(c => c.id === o.cropId)
                    }));
                } else {
                    const { data, error } = await supabase.from('offers').select('*').eq('buyerName', session.name);
                    if (error) throw error;
                    
                    // Populate crop details manually for buyer
                    const cropIds = data.map(o => o.cropId);
                    if (cropIds.length > 0) {
                        const { data: cropsData } = await supabase.from('crops').select('*').in('id', cropIds);
                        return data.map(o => ({
                            ...o,
                            cropId: cropsData?.find(c => c.id === o.cropId)
                        }));
                    }
                    return data || [];
                }
            } catch (err) {
                alert("Failed to fetch offers: " + err.message);
                return [];
            }
        },
        updateStatus: async (offerId, status) => {
            try {
                const { data: updatedOfferData, error } = await supabase.from('offers').update({ status }).eq('id', offerId).select();
                if (error) throw error;
                
                if (status === 'Accepted' && updatedOfferData && updatedOfferData.length > 0) {
                    const offer = updatedOfferData[0];
                    const { data: cropData } = await supabase.from('crops').select('*').eq('id', offer.cropId);
                    const cropName = cropData && cropData.length > 0 ? cropData[0].cropName : 'Agri-Product';
                    
                    await supabase.from('contracts').insert([{
                        cropName: cropName,
                        agreedPrice: offer.offeredPrice,
                        status: 'Active',
                        paymentStatus: 'Pending',
                        buyerName: offer.buyerName,
                        farmerName: session.name
                    }]);
                    
                    await supabase.from('crops').update({ status: 'Sold' }).eq('id', offer.cropId);
                }
                return { message: "Offer status updated!" };
            } catch(err) {
                alert("Failed to update status: " + err.message);
                return { message: "Error." };
            }
        }
    };

    const contractsApi = {
        getMyContracts: async () => {
            try {
                const roleField = session.role === 'Seller' ? 'farmerName' : 'buyerName';
                const { data, error } = await supabase.from('contracts').select('*').eq(roleField, session.name);
                if (error) throw error;
                return data || [];
            } catch (err) {
                alert("Failed to fetch contracts: " + err.message);
                return [];
            }
        },
        markPaid: async (id) => {
            try {
                const { error } = await supabase.from('contracts').update({ paymentStatus: 'Paid' }).eq('id', id);
                if (error) throw error;
                return { message: "Payment marked as paid successfully." };
            } catch (err) {
                alert("Failed to process payment: " + err.message);
                return { message: "Error updating payment." };
            }
        }
    };

    const analyticsApi = {
        getStats: async () => {
            try {
                const contracts = await contractsApi.getMyContracts();
                if (session.role === 'Seller') {
                    const crops = await cropsApi.getMyCrops();
                    const offers = await offersApi.getMyOffers();
                    return {
                        totalCrops: crops.length,
                        activeContracts: contracts.length,
                        totalEarnings: contracts.filter(c => c.paymentStatus === 'Paid').reduce((sum, c) => sum + c.agreedPrice, 0),
                        pendingOffers: offers.filter(o => o.status === 'Pending').length
                    };
                } else {
                    const offers = await offersApi.getMyOffers();
                    const availableCrops = await cropsApi.getAllAvailable();
                    return {
                        totalOrders: offers.length,
                        activeContracts: contracts.length,
                        totalSpending: contracts.filter(c => c.paymentStatus === 'Paid').reduce((sum, c) => sum + c.agreedPrice, 0),
                        availableCrops: availableCrops.length
                    };
                }
            } catch (err) {
                return { totalCrops: 0, activeContracts: 0, totalEarnings: 0, pendingOffers: 0, totalOrders: 0, totalSpending: 0, availableCrops: 0 };
            }
        }
    };

    // --- UI Helpers ---
    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    if (session) {
        document.querySelectorAll('.user-name-display').forEach(el => el.textContent = session.name);
        document.querySelectorAll('.user-role-display').forEach(el => {
            el.textContent = session.role === 'Seller' ? 'Agri-Producer' : 'Procurement Manager';
        });

        const nav = document.querySelector('aside nav');
        if (nav) {
            const currentPath = window.location.pathname;
            const sellerLinks = [
                { href: 'seller.html', icon: 'space_dashboard', text: 'Dashboard' },
                { href: 'crops.html', icon: 'eco', text: 'My Crops' },
                { href: 'marketplace.html', icon: 'storefront', text: 'Buyers Marketplace' },
                { href: 'contracts.html', icon: 'description', text: 'Contracts' },
                { href: 'payments.html', icon: 'account_balance_wallet', text: 'Payments' },
                { href: 'analytics.html', icon: 'insert_chart', text: 'Analytics' }
            ];
            const buyerLinks = [
                { href: 'buyer.html', icon: 'space_dashboard', text: 'Dashboard' },
                { href: 'marketplace.html', icon: 'storefront', text: 'Source Crops' },
                { href: 'contracts.html', icon: 'description', text: 'Contracts' },
                { href: 'payments.html', icon: 'account_balance_wallet', text: 'Payments' },
                { href: 'analytics.html', icon: 'insert_chart', text: 'Price Insights' }
            ];
            const links = session.role === 'Seller' ? sellerLinks : buyerLinks;
            nav.innerHTML = links.map(l => `
                <a class="flex items-center gap-3 px-5 py-2.5 transition-all text-[14px] ${currentPath.includes(l.href) ? 'bg-emerald-50 text-emerald-700 border-l-[3px] border-emerald-600 font-semibold' : 'text-zinc-600 hover:bg-emerald-50/60 hover:text-emerald-700 border-l-[3px] border-transparent'}" href="${l.href}">
                    <span class="material-symbols-outlined text-[20px]">${l.icon}</span> ${l.text}
                </a>
            `).join('');
        }
    }

    document.querySelectorAll('.logout-btn').forEach(btn => btn.onclick = auth.logout);

    const path = window.location.pathname;

    async function refreshGlobalStats() {
        if (!session) return;
        const stats = await analyticsApi.getStats();
        if (session.role === 'Seller') {
            setText('statTotalCrops', stats.totalCrops);
            setText('statActiveContracts', stats.activeContracts);
            setText('statEarnings', '₹' + stats.totalEarnings.toLocaleString('en-IN'));
            setText('statPending', stats.pendingOffers);
        } else {
            setText('statTotalOrders', stats.totalOrders);
            setText('statBuyerContracts', stats.activeContracts);
            setText('statSpending', '₹' + stats.totalSpending.toLocaleString('en-IN'));
            setText('statBuyerPending', stats.availableCrops);
        }
        renderActivityFeed();
    }

    async function renderActivityFeed() {
        const feedContainer = document.querySelector('.lg\\:col-span-4 .space-y-3'); 
        if (!feedContainer) return;

        const contracts = await contractsApi.getMyContracts();
        const offers = await offersApi.getMyOffers();

        let activities = [];

        contracts.forEach(c => {
            if (c.paymentStatus === 'Paid') {
                activities.push({
                    title: 'Payment Received',
                    desc: `₹${c.agreedPrice.toLocaleString()} received for ${c.cropName}`,
                    icon: 'payments',
                    color: 'emerald',
                    time: 'Recent'
                });
            } else {
                activities.push({
                    title: 'Contract Active',
                    desc: `Agreement signed with ${session.role === 'Seller' ? c.buyerName : c.farmerName}`,
                    icon: 'description',
                    color: 'blue',
                    time: 'Recently'
                });
            }
        });

        offers.forEach(o => {
            if (o.status === 'Pending') {
                activities.push({
                    title: session.role === 'Seller' ? 'New Offer' : 'Offer Sent',
                    desc: `${session.role === 'Seller' ? o.buyerName : 'Offer'} for ${o.cropId?.cropName || 'Crop'} at ₹${o.offeredPrice}`,
                    icon: 'handshake',
                    color: 'amber',
                    time: 'Just now'
                });
            }
        });

        if (activities.length === 0) {
            feedContainer.innerHTML = '<p class="text-zinc-400 text-center py-5">No recent activities.</p>';
            return;
        }

        feedContainer.innerHTML = activities.slice(0, 5).map(a => `
            <div class="flex gap-3 p-3 bg-${a.color}-50 rounded-lg border border-${a.color}-100 fade-up">
                <div class="w-9 h-9 bg-${a.color}-200 rounded-lg flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-${a.color}-800 text-[16px]">${a.icon}</span>
                </div>
                <div class="text-left">
                    <p class="text-[13px] font-semibold text-${a.color}-900">${a.title}</p>
                    <p class="text-[11px] text-zinc-500 mt-0.5">${a.desc}</p>
                    <p class="text-[10px] text-zinc-400 mt-1">${a.time}</p>
                </div>
            </div>
        `).join('');
    }

    if (path.includes('seller.html') && session) {
        async function renderSeller() {
            const crops = await cropsApi.getMyCrops();
            const offers = await offersApi.getMyOffers();
            const list = document.getElementById('activeListings');
            const incOffers = document.getElementById('incomingOffers');

            if (list) {
                list.innerHTML = crops.length ? crops.map(c => `
                    <div class="flex items-center justify-between p-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <div><p class="font-bold text-emerald-950">${c.cropName}</p><p class="text-[11px] text-zinc-500">${c.quantity} · ${c.location}</p></div>
                        <span class="text-[10px] font-bold px-2 py-1 rounded ${c.status==='Available'?'bg-emerald-50 text-emerald-600':'bg-emerald-100 text-emerald-800'}">${c.status}</span>
                    </div>
                `).join('') : '<p class="text-zinc-400 text-center py-5">No listings.</p>';
            }

            if (incOffers) {
                const pendings = offers.filter(o => o.status === 'Pending');
                incOffers.innerHTML = pendings.length ? pendings.map(o => `
                    <div class="p-4 bg-zinc-50 rounded-lg border border-zinc-200 mb-3 shadow-sm text-left">
                        <div class="flex justify-between items-start mb-2">
                            <div><p class="font-bold text-emerald-950 text-[14px]">${o.cropId?.cropName || 'Crop'}</p><p class="text-[11px] text-zinc-500">From: ${o.buyerName}</p></div>
                            <p class="font-bold text-emerald-800 text-[14px]">₹${o.offeredPrice.toLocaleString()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="handleOffer('${o.id}', 'Accepted')" class="flex-1 bg-emerald-700 text-white text-[10px] py-1.5 rounded-md font-bold">Accept</button>
                            <button onclick="handleOffer('${o.id}', 'Rejected')" class="flex-1 bg-zinc-200 text-zinc-700 text-[10px] py-1.5 rounded-md font-bold">Reject</button>
                        </div>
                    </div>
                `).join('') : '<p class="text-zinc-400 text-center py-5">No new offers.</p>';
            }
        }
        window.handleOffer = async (id, status) => {
            const res = await offersApi.updateStatus(id, status);
            alert(res.message);
            renderSeller();
            refreshGlobalStats();
        };
        const form = document.getElementById('createContractForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await cropsApi.addCrop({
                    cropName: document.getElementById('cropName').value,
                    quantity: document.getElementById('cropQty').value,
                    price: document.getElementById('cropPrice').value,
                    location: document.getElementById('cropLocation').value
                });
                form.reset();
                renderSeller();
                refreshGlobalStats();
            };
        }
        renderSeller();
    }

    if ((path.includes('marketplace.html') || path.includes('buyer.html')) && session) {
        async function renderMarket() {
            const list = document.getElementById('marketplaceList') || document.getElementById('marketplaceFeed');
            if(!list) return;
            const crops = await cropsApi.getAllAvailable();
            list.innerHTML = crops.length ? crops.map(c => `
                <div class="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all text-left">
                    <div class="flex justify-between mb-4"><span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase">${c.cropName}</span><p class="font-bold text-emerald-800">₹${c.price.toLocaleString()}</p></div>
                    <h3 class="font-bold text-emerald-950 mb-1">${c.farmerName}</h3>
                    <p class="text-[12px] text-zinc-500 mb-4">${c.location} · ${c.quantity}</p>
                    <button onclick="sendMarketOffer('${c.id}', ${c.price})" class="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold text-[13px] hover:bg-emerald-900 transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">handshake</span> Send Offer
                    </button>
                </div>
            `).join('') : '<p class="col-span-full py-10 text-center text-zinc-400">No crops available.</p>';
        }
        window.sendMarketOffer = async (id, price) => {
            const bid = prompt("Enter your bid price (₹):", price);
            if (bid) {
                const res = await offersApi.sendOffer({ cropId: id, offeredPrice: parseFloat(bid) });
                alert(res.message);
                refreshGlobalStats();
            }
        };
        renderMarket();
    }

    if (path.includes('contracts.html') && session) {
        async function renderContracts() {
            const list = document.getElementById('contractsList');
            if(!list) return;
            const contracts = await contractsApi.getMyContracts();
            list.innerHTML = contracts.length ? contracts.map(c => `
                <div class="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex justify-between items-center mb-4 text-left">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[24px]">description</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-emerald-950 text-[16px]">${c.cropName}</h3>
                            <p class="text-[12px] text-zinc-500">${session.role==='Seller'?'Buyer: '+c.buyerName:'Farmer: '+c.farmerName}</p>
                            <div class="flex gap-2 mt-2">
                                <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase">${c.status}</span>
                                <span class="text-[9px] font-bold px-2 py-0.5 rounded ${c.paymentStatus==='Paid'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'} uppercase">${c.paymentStatus}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-emerald-800 text-[18px]">₹${c.agreedPrice.toLocaleString()}</p>
                        ${(session.role==='Buyer' && c.paymentStatus==='Pending') ? `<button onclick="payContract('${c.id}')" class="mt-2 bg-emerald-700 text-white px-4 py-1.5 rounded-md text-[11px] font-bold">Mark Paid</button>`:''}
                    </div>
                </div>
            `).join('') : '<p class="py-10 text-center text-zinc-400">No contracts found.</p>';
        }
        window.payContract = async (id) => {
            const res = await contractsApi.markPaid(id);
            alert(res.message);
            renderContracts();
            refreshGlobalStats();
        };
        renderContracts();
    }

    if (path.includes('payments.html') && session) {
        async function renderPayments() {
            const contracts = await contractsApi.getMyContracts();
            const paid = contracts.filter(c => c.paymentStatus === 'Paid');
            const total = paid.reduce((s, c) => s + c.agreedPrice, 0);
            setText('statTotalFlow', '₹' + total.toLocaleString('en-IN'));
            setText('statTotalCount', paid.length);
            
            const table = document.getElementById('paymentsTable');
            if (table) {
                table.innerHTML = paid.length ? paid.map(c => `
                    <tr class="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                        <td class="py-4 px-4 text-[13px] font-bold text-emerald-950 uppercase tracking-tighter">
                            #${String(c.id).slice(-6)}
                        </td>
                        <td class="py-4 px-4 text-[13px] text-zinc-600">${c.cropName}</td>
                        <td class="py-4 px-4 text-[13px] text-zinc-600">${session.role==='Seller'?c.buyerName:c.farmerName}</td>
                        <td class="py-4 px-4"><span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Paid</span></td>
                        <td class="py-4 px-4 text-right font-bold text-emerald-950 font-mono">₹${c.agreedPrice.toLocaleString()}</td>
                    </tr>
                `).join('') : '<tr><td colspan="5" class="py-20 text-center text-zinc-400">No payment history found.</td></tr>';
            }
        }
        renderPayments();
    }

    if (path.includes('analytics.html') && session) {
        async function renderAnalytics() {
            const bars = document.querySelectorAll('.h-64 div, .h-\\[180px\\] div');
            bars.forEach(bar => {
                const randomHeight = Math.floor(Math.random() * 40) + 40; 
                bar.style.height = randomHeight + '%';
            });
        }
        renderAnalytics();
    }

    const authForm = document.getElementById('authForm');
    if (authForm) {
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const signupFields = document.querySelectorAll('.signup-fields');
        const btnText = document.getElementById('btnText');
        const authSubtitle = document.getElementById('authSubtitle');
        const authMsg = document.getElementById('authMsg');
        let mode = 'login';

        function setMode(m) {
            mode = m;
            signupFields.forEach(f => f.style.display = m === 'signup' ? 'block' : 'none');
            btnText.textContent = m === 'signup' ? 'Create Account' : 'Login';
            authSubtitle.textContent = m === 'signup' ? 'Join AgriContract' : 'Login to your account';
            if(loginTab) loginTab.classList.toggle('active', m === 'login');
            if(signupTab) signupTab.classList.toggle('active', m === 'signup');
        }
        if(loginTab) loginTab.onclick = () => setMode('login');
        if(signupTab) signupTab.onclick = () => setMode('signup');
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const contact = document.getElementById('contact').value;
            const password = document.getElementById('password').value;
            if (mode === 'signup') {
                const res = await auth.signup(document.getElementById('fullName').value, contact, password, document.getElementById('role').value);
                if (res.success) { alert('Signed up! Logging in...'); setMode('login'); }
                else { authMsg.textContent = res.message; authMsg.className = 'auth-msg error'; }
            } else {
                const res = await auth.login(contact, password);
                if (res.success) {
                    window.location.href = res.user.role === 'Buyer' ? 'buyer.html' : 'seller.html';
                } else { 
                    authMsg.textContent = res.message; authMsg.className = 'auth-msg error text-red-500 font-bold mt-2'; 
                }
            }
        };
    }

    refreshGlobalStats();
    
    document.querySelectorAll('.fade-up').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.05}s`;
    });
});
