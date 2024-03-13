export default function positionIndicator(position:string | number) {
    if (typeof position === 'string') {
        if (position === 'ceo') {
            return 1
        }
    } else {
        if (position === 1) {
            return 'ceo'
        }
    }
}