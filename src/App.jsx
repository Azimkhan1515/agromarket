import {useState,useEffect} from 'react';
import ProductCard from './components/ProductCard.jsx';
import Icon from './components/Icons.jsx';
import {getProducts,request,labMode,money,readStore} from './api.js';
const categories=['Все продукты','Овощи','Фрукты','Молочные продукты','Мёд и бакалея'];
export default function App(){
 const [authOpen,setAuthOpen]=useState(false),[profileOpen,setProfileOpen]=useState(false),[orders,setOrders]=useState(()=>readStore('agro-orders',[])),[authMode,setAuthMode]=useState('register'),[currentUser,setCurrentUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('agro-user'))}catch{return null}}),[authStatus,setAuthStatus]=useState('');
 const [products,setProducts]=useState([]),[searchTerm,setSearchTerm]=useState(''),[category,setCategory]=useState('Все продукты'),[sort,setSort]=useState('default'),[loading,setLoading]=useState(true),[error,setError]=useState(null),[page,setPage]=useState('shop'),[cart,setCart]=useState(()=>readStore('agro-cart',[])),[favorites,setFavorites]=useState(()=>readStore('agro-favorites',[])),[onlyFavorites,setOnlyFavorites]=useState(false),[cartOpen,setCartOpen]=useState(false),[toast,setToast]=useState(''),[status,setStatus]=useState(''),[sending,setSending]=useState(false),[dark,setDark]=useState(()=>{try{return localStorage.getItem('agro-theme')==='dark';}catch{return false;}});
 async function loadProducts(signal){setLoading(true);setError(null);try{const data=await getProducts(signal);if(!Array.isArray(data))throw new Error('Неверный формат каталога');setProducts(data);}catch(e){if(e.name!=='AbortError')setError(`Не удалось загрузить товары. ${e.message}`);}finally{if(!signal?.aborted)setLoading(false);}}
 useEffect(()=>{const controller=new AbortController();loadProducts(controller.signal);if(labMode)request('/orders').then(setOrders).catch(()=>{});return()=>controller.abort();},[]);
 useEffect(()=>{try{localStorage.setItem('agro-cart',JSON.stringify(cart));localStorage.setItem('agro-favorites',JSON.stringify(favorites));}catch{/* Работа продолжается без сохранения. */}},[cart,favorites]);
 useEffect(()=>{document.querySelector('html').classList.toggle('dark',dark);document.querySelectorAll('meta[name="theme-color"]').forEach(meta=>meta.setAttribute('content',dark?'#15251b':'#294b35'));try{localStorage.setItem('agro-theme',dark?'dark':'light');}catch{}},[dark]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(timer);},[toast]);
 useEffect(() => {
  if (!profileOpen || !currentUser) return;

  const dialog = document.getElementById("profile-dialog");

  if (!dialog) return;

  if (!dialog.open) {
    dialog.showModal();
  }

  return () => {
    if (dialog.open) {
      dialog.close();
    }
  };
}, [profileOpen, currentUser]);
 useEffect(()=>{if(!cartOpen)return;const dialog=document.querySelector('#cart-dialog');dialog.showModal();return()=>{if(dialog.open)dialog.close();};},[cartOpen]);
 const cartCount=cart.reduce((sum,item)=>sum+item.qty,0),total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
 const filteredProducts=products.filter(p=>p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())&&(category==='Все продукты'||p.category===category)&&(!onlyFavorites||favorites.includes(p.id))).sort((a,b)=>sort==='asc'?a.price-b.price:sort==='desc'?b.price-a.price:0);
 function handleAddToCart(product){setCart(prev=>{const existing=prev.find(item=>item.id===product.id);return existing?prev.map(item=>item.id===product.id?{...item,qty:item.qty+1}:item):[...prev,{...product,qty:1}];});setToast(`${product.name} — в корзине`);}
 function changeQty(id,delta){setCart(prev=>prev.map(item=>item.id===id?{...item,qty:item.qty+delta}:item).filter(item=>item.qty>0));}
 const toggleFavorite=id=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 async function sendFeedback(event){event.preventDefault();const form=event.currentTarget;const data=Object.fromEntries(new FormData(form));if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||!data.name.trim()||!data.message.trim()){setStatus('Заполните имя, сообщение и корректный email.');return;}setSending(true);try{if(labMode){await request('/messages',{method:'POST',body:JSON.stringify({...data,createdAt:new Date().toISOString()})});setStatus('Сообщение сохранено на учебном сервере.');}else{const messages=readStore('agro-messages',[]);localStorage.setItem('agro-messages',JSON.stringify([...messages,{...data,createdAt:new Date().toISOString()}]));setStatus('Черновик сохранён в этом браузере. Отправка фермеру в демоверсии не подключена.');}form.reset();}catch(e){setStatus(`Не удалось сохранить: ${e.message}`);}finally{setSending(false);}}
 async function checkout(event){event.preventDefault();if(!cart.length)return;const form=event.currentTarget;const data=Object.fromEntries(new FormData(form));if(!data.name.trim()||!data.address.trim()){setStatus('Укажите имя и адрес.');return;}setSending(true);try{const order={...data,email:currentUser?.email||'',userId:currentUser?.id||null,items:cart,total,createdAt:new Date().toISOString()};if(labMode){await request('/orders',{method:'POST',body:JSON.stringify(order)});setOrders(prev=>[...prev,order]);}else{const saved=[...readStore('agro-orders',[]),order];localStorage.setItem('agro-orders',JSON.stringify(saved));setOrders(saved);}setCart([]);setCartOpen(false);setToast(labMode?'Учебный заказ сохранён на сервере':'Демо-заказ сохранён в браузере. Доставка не оформлена.');}catch(e){setStatus(`Ошибка заказа: ${e.message}`);}finally{setSending(false);}}
 async function handleAuth(event){
  event.preventDefault(); setAuthStatus('');
  const form=event.currentTarget, data=Object.fromEntries(new FormData(form));
  const name=(data.name||'').trim(), email=(data.email||'').trim().toLowerCase(), password=data.password||'';
  if(!email || password.length<6 || (authMode==='register' && !name)){setAuthStatus('Укажите данные. Пароль должен содержать минимум 6 символов.');return;}
  try {
   const users=labMode?await request('/users'):readStore('agro-users',[]);
   const existing=users.find(u=>u.email.toLowerCase()===email);
   if(authMode==='register'){
    if(existing){setAuthStatus('Пользователь с таким email уже зарегистрирован.');return;}
    const user={id:Date.now(),name,email,password,createdAt:new Date().toISOString()};
    if(labMode) await request('/users',{method:'POST',body:JSON.stringify(user)}); else localStorage.setItem('agro-users',JSON.stringify([...users,user]));
    const session={id:user.id,name:user.name,email:user.email};localStorage.setItem('agro-user',JSON.stringify(session));setCurrentUser(session);setAuthStatus('Регистрация прошла успешно.');
   }else{
    if(!existing||existing.password!==password){setAuthStatus('Неверный email или пароль.');return;}
    const session={id:existing.id,name:existing.name,email:existing.email};localStorage.setItem('agro-user',JSON.stringify(session));setCurrentUser(session);setAuthStatus('Вы вошли в аккаунт.');
   }
   form.reset();setTimeout(()=>setAuthOpen(false),700);
  }catch(e){setAuthStatus(`Не удалось выполнить запрос: ${e.message}. Проверьте json-server.`);}
 }
 function logout(){setProfileOpen(false);localStorage.removeItem('agro-user');setCurrentUser(null);setAuthStatus('Вы вышли из аккаунта.');}
 function goCatalog(){setPage('shop');setTimeout(()=>document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'}),0);}
 return <><div className="topbar"><span>От фермы — к вашему столу</span><span>Демо-магазин · Казахстан <span className="top-dot">●</span></span></div><header className="island-header"><a className="brand" href="#" onClick={()=>setPage('shop')}><span className="brand-icon"><Icon name="leaf" size={27}/></span>Агро<span>Маркет</span><small>СВЕЖЕЕ. БЛИЖЕ. СВОЁ.</small></a><nav aria-label="Основная навигация"><button className={page==='shop'?'nav-active':''} onClick={goCatalog}>Каталог</button><a href="#about" onClick={()=>setPage('shop')}>О проекте</a><a href="#contact" onClick={()=>setPage('shop')}>Контакты</a></nav><div className="header-actions"><button className="icon-btn" onClick={()=>setDark(!dark)} aria-label="Переключить тему"><Icon name="sun"/></button><button className="cart-button" onClick={()=>{if(currentUser){setProfileOpen(true);}else{setAuthStatus('');setAuthMode('login');setAuthOpen(true);}}}><Icon name="user" size={18}/><span>{currentUser?(currentUser.name?.trim()?.split(/\s+/)[0]||'Профиль'):'Войти'}</span></button>{currentUser&&<button className="icon-btn" onClick={logout} title="Выйти из аккаунта">Выйти</button>}<button className="cart-button" onClick={()=>{setStatus('');setCartOpen(true);}}><Icon name="bag" size={20}/><span>Корзина</span><b>{cartCount}</b></button></div></header>
 <main><><section className="hero"><div className="hero-content"><p className="eyebrow"><span className="tiny-dot"/> ВЫРАЩЕНО С ЗАБОТОЙ</p><h1>Ближе к природе.<br/><em>Ближе к вам.</em></h1><p>Настоящий вкус, знакомые фермеры.<br/>Свежие продукты из хозяйств Казахстана<br className="desktop"/> для вашего стола.</p><button className="primary" onClick={goCatalog}>Выбрать продукты <Icon name="arrow" size={19}/></button><div className="hero-caption"><span className="round-leaf"><Icon name="leaf" size={18}/></span><span>Природа знает, что лучше.<br/><strong>Мы помогаем это найти.</strong></span></div></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=85" onError={e=>{e.currentTarget.src='/hero.jpg'}} alt="Свежие овощи и зелень на фермерском рынке"/><span className="image-label">СВЕЖИЙ СЕЗОН <b>’26</b></span><div className="harvest-note"><span>С ПОЛЯ НА ВАШ СТОЛ</span><strong>Вкус настоящего</strong><p>Маленькие хозяйства. Большая забота.</p></div></div></section>
 <div className="benefits"><div><Icon name="leaf"/><span><strong>От местных фермеров</strong><small>Знакомим с происхождением продуктов</small></span></div><div><Icon name="check"/><span><strong>Простой выбор</strong><small>Состав, цена и хозяйство на виду</small></span></div><div><Icon name="truck"/><span><strong>Удобная корзина</strong><small>Соберите продукты в одном месте</small></span></div></div>
 <section className="section" id="catalog"><div className="section-heading"><div><p className="eyebrow">ХОРОШЕЕ НАЧИНАЕТСЯ С ПРОСТОГО</p><h2>Свежий выбор</h2></div><span className="season">Сезонные продукты <span>↗</span></span></div><div className="catalog-tools"><div className="tabs">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search"><Icon name="search" size={18}/><input placeholder="Найти продукты…" aria-label="Поиск товаров" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>{searchTerm&&<button aria-label="Очистить поиск" onClick={()=>setSearchTerm('')}>×</button>}</label></div><div className="catalog-meta"><span>{filteredProducts.length} продуктов <span className="muted">· отборные, как для себя</span></span><div><button className={'favorites-filter '+(onlyFavorites?'selected':'')} onClick={()=>setOnlyFavorites(!onlyFavorites)} aria-pressed={onlyFavorites}><Icon name="heart" size={16}/> Избранное ({favorites.length})</button><select aria-label="Сортировка товаров" value={sort} onChange={e=>setSort(e.target.value)}><option value="default">По умолчанию</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option></select></div></div>{loading?<div className="empty" role="status">Загружаем свежий урожай…</div>:error?<div className="empty error" role="alert">{error}<br/><button className="outline" onClick={()=>loadProducts()}>Повторить загрузку</button>{labMode&&<p>Запустите npm run server в отдельном терминале.</p>}</div>:filteredProducts.length?<div className="product-grid">{filteredProducts.map(product=><ProductCard key={product.id} product={product} onAdd={handleAddToCart} favorite={favorites.includes(product.id)} onFavorite={toggleFavorite}/>)}</div>:<div className="empty">По вашему запросу ничего не найдено.<br/><button className="outline" onClick={()=>{setSearchTerm('');setCategory('Все продукты');setOnlyFavorites(false);}}>Сбросить фильтры</button></div>}</section>
 <section className="story section" id="about"><div><p className="eyebrow">ЗНАКОМОЕ ПРОИСХОЖДЕНИЕ</p><h2>За каждым продуктом —<br/><em>чья-то забота.</em></h2></div><div><p>АгроМаркет объединяет идею местного фермерства и удобного выбора продуктов. Здесь легко найти сезонные овощи, фрукты, молочные продукты и мёд.</p><p className="muted">Это учебный проект. Товары, хозяйства и цены приведены для демонстрации. Оплата и реальная доставка не подключены.</p><button className="text-link" onClick={goCatalog}>Выбрать продукты <Icon name="arrow" size={18}/></button></div></section>
 <section className="contact section" id="contact"><div><p className="eyebrow">ДАВАЙТЕ НА СВЯЗИ</p><h2>Хорошие идеи<br/>растут вместе.</h2><p>Оставьте вопрос или предложение для проекта.</p><small>{labMode?'Форма отправляет POST /messages на json-server.':'В демоверсии сообщение сохраняется только в вашем браузере.'}</small></div><form onSubmit={sendFeedback}><div className="form-row"><label>Ваше имя<input name="name" placeholder="Как к вам обращаться" required maxLength="100"/></label><label>Email<input name="email" type="email" placeholder="you@example.com" required/></label></div><label>Сообщение<textarea name="message" placeholder="Расскажите о вашей идее…" required maxLength="2000"/></label><button className="primary" disabled={sending}>{sending?'Сохраняем…':labMode?'Отправить сообщение':'Сохранить черновик'}<Icon name="arrow" size={18}/></button><p role="status">{status}</p></form></section></></main>
 <footer><a className="brand" href="#" onClick={()=>setPage('shop')}><Icon name="leaf"/>АгроМаркет</a><span>С заботой о природе и о вас. © 2026</span><a href="/agromarket-source.zip" download>Исходный код ↗</a></footer><div className={'toast '+(toast?'show':'')} role="status">{toast}</div>
 {profileOpen && currentUser && (
  <dialog
    id="profile-dialog"
    className="auth-dialog profile-dialog"
    onClose={() => setProfileOpen(false)}
    onCancel={() => setProfileOpen(false)}
  >
    <div className="dialog-content">

      <div className="dialog-heading">
        <h2>Мой профиль</h2>

        <button
          className="icon-btn"
          onClick={() => setProfileOpen(false)}
        >
          ✕
        </button>
      </div>

      <div className="profile-summary">
        <div className="profile-avatar">
          <Icon name="user" size={28} />
        </div>

        <div>
          <h3>{currentUser.name}</h3>
          <p>{currentUser.email}</p>
        </div>
      </div>

      <div className="profile-details">

        <div>
          <span>Статус аккаунта</span>
          <strong>Активен</strong>
        </div>

        <div>
          <span>Мои заказы</span>
          <strong>
            {orders.filter(
              o => o.email?.toLowerCase() ===
                   currentUser.email?.toLowerCase()
            ).length}
          </strong>
        </div>

        <div>
          <span>Избранные товары</span>
          <strong>{favorites.length}</strong>
        </div>

      </div>

      <button
        className="primary"
        onClick={() => {
          setProfileOpen(false);
          logout();
        }}
      >
        Выйти из аккаунта
      </button>

    </div>
  </dialog>
)}{authOpen&&<dialog open className="auth-dialog"><div className="dialog-content"><div className="dialog-heading"><h2>{authMode==='register'?'Регистрация':'Вход в аккаунт'}</h2><button className="icon-btn" aria-label="Закрыть" onClick={()=>setAuthOpen(false)}><Icon name="close"/></button></div><div className="tabs"><button className={authMode==='register'?'active':''} onClick={()=>{setAuthMode('register');setAuthStatus('');}}>Регистрация</button><button className={authMode==='login'?'active':''} onClick={()=>{setAuthMode('login');setAuthStatus('');}}>Войти</button></div><form onSubmit={handleAuth}>{authMode==='register'&&<label>Имя<input name="name" autoComplete="name" required maxLength="100" placeholder="Ваше имя"/></label>}<label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label><label>Пароль<input name="password" type="password" autoComplete={authMode==='register'?'new-password':'current-password'} minLength="6" required placeholder="Минимум 6 символов"/></label><button className="primary">{authMode==='register'?'Создать аккаунт':'Войти'}</button><p role="status">{authStatus}</p><p className="muted">Учебная авторизация через JSON. Не используйте настоящий пароль: демоверсия не хеширует пароли и не предназначена для реальных аккаунтов.</p></form></div></dialog>}
 {cartOpen&&<dialog id="cart-dialog" onCancel={()=>setCartOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setCartOpen(false);}}><div className="dialog-content"><div className="dialog-heading"><h2>Ваша корзина <small>{cartCount}</small></h2><button className="icon-btn" aria-label="Закрыть корзину" onClick={()=>setCartOpen(false)}><Icon name="close"/></button></div>{cart.length?<><div className="cart-items">{cart.map(item=><div className="cart-row" key={item.id}><img src={item.image} alt={item.name}/><div><strong>{item.name}</strong><small>{money(item.price)} ₸ / {item.unit}</small><button className="text-link" onClick={()=>setCart(prev=>prev.filter(x=>x.id!==item.id))}>Удалить</button></div><div className="qty"><button aria-label={`Уменьшить ${item.name}`} onClick={()=>changeQty(item.id,-1)}>−</button><span>{item.qty}</span><button aria-label={`Увеличить ${item.name}`} onClick={()=>changeQty(item.id,1)}>+</button></div></div>)}</div><div className="total"><span>Итого</span><strong>{money(total)} ₸</strong></div><p className="notice">Учебный заказ: оплаты и реальной доставки нет. {labMode?'Сохраняется через POST /orders.':'Сохраняется в этом браузере.'}</p><form onSubmit={checkout}><label>Имя<input name="name" required autoFocus/></label><label>Адрес<input name="address" required/></label><button className="primary" disabled={sending}>{sending?'Сохранение…':'Сохранить учебный заказ'}<Icon name="arrow" size={18}/></button><p role="status">{status}</p></form></>:<div className="empty"><Icon name="bag" size={44}/><h3>Здесь пока пусто</h3><p>Добавьте немного свежего в свой день.</p><button className="primary" onClick={()=>{setCartOpen(false);goCatalog();}}>Перейти к продуктам</button></div>}</div></dialog>}
 </>;
}
