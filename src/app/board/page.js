import styles from "./page.module.css";


export default function Board() {
    const stack_title = 'TO DO';
    const tasks = [
        {
            title: 'React',
        },
        {
            title: 'Build',
        },
        {
            title: 'Deploy',
        },
    ];

    return (
        <main>
            <div className={styles.grid}>
                <div className={styles.stack}>
                    <div className={styles.center}><p>{stack_title}</p></div>
                    { tasks.map((v, i) => (<div className={styles.task}><p key={i}>{v.title}</p></div>)) }
                </div>
                <div className={styles.stack}><p>Task 2</p></div>
                <div className={styles.stack}><p>Task 3</p></div>
            </div>
        </main>
    );
}