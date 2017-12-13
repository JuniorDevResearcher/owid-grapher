import * as React from 'react'

export default class LoadingBlocker extends React.Component {
    render() {
        const style: any = {
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'black',
            opacity: 0.5,
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            color: 'white'
        }
        return <div style={style}>
            <i className="fa fa-spinner fa-spin" />
        </div>
    }
}