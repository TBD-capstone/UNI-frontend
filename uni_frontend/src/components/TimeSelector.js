import Select from 'react-select';
import React, {useState} from "react";
import "./Component.css";

const clockList = [
    {label: '1', value: 1},
    {label: '2', value: 2},
    {label: '3', value: 3},
    {label: '4', value: 4},
    {label: '5', value: 5},
    {label: '6', value: 6},
    {label: '7', value: 7},
    {label: '8', value: 8},
    {label: '9', value: 9},
    {label: '10', value: 10},
    {label: '11', value: 11},
    {label: '12', value: 12}
];
const ampmList = [
    {label: 'am', value: 'am'},
    {label: 'pm', value: 'pm'},
];

const TimeSelector = ({onChange}) => {
    const handleChange = (i) => {
        return (option) => onChange(prev => {
            let list = prev;
            list.splice(i, 1, option.value);
            return list;
        })
    }
    return (
        <div className="time-section">
            <div className={"time-box"}>
                <Select
                    className="time-select"
                    options={clockList}
                    onChange={handleChange(0)}
                    defaultValue={clockList[11]}
                />
                <Select
                    className="time-select"
                    options={ampmList}
                    onChange={handleChange(1)}
                    defaultValue={ampmList[0]}
                />
            </div>
            <div className={"auto-margin"}>-</div>
            <div className={"time-box"}>
                <Select
                    className="time-select"
                    options={clockList}
                    onChange={handleChange(2)}
                    defaultValue={clockList[11]}
                />
                <Select
                    className="time-select"
                    options={ampmList}
                    onChange={handleChange(3)}
                    defaultValue={ampmList[0]}
                />
            </div>
        </div>
    )
}

export default TimeSelector;