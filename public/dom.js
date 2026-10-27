// Самостоятельный учебный DOM-модуль: подключается в dom.html с defer.
function init(){
 const title=document.querySelector('h1');title.textContent='АгроМаркет · чистый JavaScript';title.style.color='green';
 const list=document.querySelector('#list'),form=document.querySelector('form'),out=document.querySelector('#out');
 document.querySelector('#theme').addEventListener('click',()=>document.body.classList.toggle('dark'));
 document.querySelectorAll('[data-hint]').forEach(el=>el.setAttribute('title',el.dataset.hint));
 form.addEventListener('submit',event=>{event.preventDefault();const input=form.elements.product;const name=input.value.trim();if(!name){out.textContent='Введите название продукта';return;}const li=document.createElement('li');li.textContent=`${name} `;const button=document.createElement('button');button.textContent='Удалить';li.append(button);list.append(li);input.value='';out.textContent='Добавлено';});
 list.addEventListener('click',event=>{if(event.target.matches('button'))event.target.closest('li').remove();});
 form.elements.product.addEventListener('input',event=>{out.textContent=`Символов: ${event.target.value.length}`;});
 form.elements.product.addEventListener('keydown',event=>{if(event.key==='Escape'){event.target.value='';out.textContent='Очищено клавишей Escape';}});
 document.querySelector('select').addEventListener('change',event=>{list.classList.toggle('compact',event.target.value==='compact');});
 document.querySelector('#promise').addEventListener('click',()=>{out.textContent='Загрузка…';fetch('/db.json').then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}).then(({products})=>{out.textContent=products.map(p=>p.name).join(', ');}).catch(error=>{out.textContent=error.message;}).finally(()=>{document.querySelector('#promise').textContent='Повторить Promise';});});
}
// Скрипт defer выполняется после разбора HTML, до DOMContentLoaded.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
