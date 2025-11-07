type DifficultyProps = {
    difficulty: number
    onClick?: () => void
}

export default function DifficultyBar(props: DifficultyProps) {
    return (
        <div className="difficulty-bar">
            <div className="difficulty difficulty-bar-very-easy">Very Easy</div>
            <div className="difficulty difficulty-bar-easy">Easy</div>
            <div className="difficulty difficulty-bar-medium">Medium</div>
            <div className="difficulty difficulty-bar-hard">Hard</div>
            <div className="difficulty difficulty-bar-very-easy">Very Hard</div>
        </div>
    )
}