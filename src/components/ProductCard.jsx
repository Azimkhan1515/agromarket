import Icon from './Icons.jsx';
import {money} from '../api.js';
export default function ProductCard({ product, onAdd, favorite, onFavorite }) {
 const {name, image, price, unit, farm, badge, oldPrice} = product;
 return <article className="product-card"><div className="product-photo"><img src={image} alt={name} loading="lazy"/>{badge&&<span className="badge">{badge}</span>}<button className={'favorite '+(favorite?'selected':'')} aria-label={favorite?'Убрать из избранного':'В избранное'} aria-pressed={favorite} onClick={()=>onFavorite(product.id)}><Icon name="heart" size={19}/></button></div><div className="product-body"><small>{farm}</small><h3>{name}</h3><div className="product-bottom"><div><strong>{money(price)} ₸</strong>{oldPrice&&<del>{money(oldPrice)} ₸</del>}<span>за {unit}</span></div><button className="add" aria-label={`Добавить ${name} в корзину`} onClick={()=>onAdd(product)}>+</button></div></div></article>;
}
