export default function positionIndicator(position:string | number) {
    if (typeof position === 'string') {
        if (position === 'ceo') {
            return 1
        } else if (position === 'director') {
            return 2
        } else if (position === 'administrator') {
            return 3
        }
    } else {
        if (position === 1) {
            return 'ceo'
        } else if (position === 2) {
            return 'director'
        } else if (position === 3) {
            return 'administrator'
        }
    }
}