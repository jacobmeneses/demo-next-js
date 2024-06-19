import { useDroppable, useDraggable } from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from "./page.module.css";
import componentStyles from './components.module.css'
import { StaticsBaseUrl, DefaultThumbnail } from '../constants';

export function ThumbnailProfile({ imageUrl, name }) {
    return (
        <img src={imageUrl} alt={`${name}`} className={componentStyles.profileImage} />
    );
};

export function Draggable(props) {
    const { id, v, onClickDelete, isDone } = props;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: id,
    });
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    const isDoneStyle = isDone ? {
        'textDecoration' : 'line-through'
    } : undefined;
    const thumbnail = v.creator && v.creator.thumbnail ? v.creator.thumbnail : DefaultThumbnail;
    const creatorName = v.creator ? v.creator.name : '';

    return (
      <div key={id} ref={setNodeRef} className={styles.task} style={style} {...attributes}>
        <FontAwesomeIcon onClick={(e) => {
            e.stopPropagation()
            onClickDelete(e)
        }} className={styles.xmarkIcon} icon={faXmark} />
        <div className={styles.taskInner} >
            <ThumbnailProfile imageUrl={StaticsBaseUrl + 'images/' + thumbnail } name={creatorName}></ThumbnailProfile>
            <p style={isDoneStyle} {...listeners} key={id}>{v.title}</p>
            </div>
      </div>
    );
}

export function Droppable(props) {
    const { title, onKeyDownNewTask, newTaskText, onChangeNewTaskText } = props;
    const { isOver, setNodeRef } = useDroppable({
      id: props.id,
    });
    const style = {
      color: isOver ? 'green' : undefined,
    };

    return (
      <div className={styles.stack} ref={setNodeRef} style={style}>
        <div className={styles.center}><p>{title} {props.children.length}</p></div>
        <div key={props.id+'-add-new'} className={styles.task}>
            <input placeholder='Type new task title and press ENTER' className={styles.newTaskInput} onChange={onChangeNewTaskText} onKeyDown={(e) => onKeyDownNewTask(e)} value={newTaskText} type="text"/></div>
        {props.children}
      </div>
    );
}
