import React, { useState, useEffect, useContext } from 'react';
import { IconAccessPoint, IconBattery1, IconBattery2, IconBattery3, IconBattery4, IconBatteryCharging, IconPower } from '@tabler/icons';
import { connect } from 'react-redux';
import { useSimVar } from '../../Common/simVars';
import { efbClearState } from '../Store/action-creator/efb';
import { changeEfbBatteryLevel } from '../Store/action-creator/efb-battery';

import { PowerContext, ContentState } from '../index';
import { EFB_BATTERY_REDUCER } from '../Store';

type StatusBarProps = {
    initTime: Date,
    updateTimeSinceStart: (newTimeSinceStart: string) => void,
    updateCurrentTime: (newCurrentTime: Date) => void,
    batteryLevel: number,
    efbClearState: () => {},
    changeEfbBatteryLevel: (level: number) => {}
}

export function formatTime(numbers: number[]) {
    if (numbers.length === 2) {
        return `${(numbers[0] <= 9 ? '0' : '') + numbers[0]}:${numbers[1] <= 9 ? '0' : ''}${numbers[1]}`;
    } if (numbers.length === 3) {
        return `${(numbers[0] <= 9 ? '0' : '') + numbers[0]}:${numbers[1] <= 9 ? '0' : ''}${numbers[1]}:${numbers[2] <= 9 ? '0' : ''}${numbers[2]}`;
    }
    return 'N/A';
}

export function dateFormat(date: number): string {
    let numberWithSuffix: string;
    const dateRemOf10 = date % 10;
    const dateRemOf100 = date % 100;

    if ((dateRemOf10 === 1) && (dateRemOf100 !== 11)) {
        numberWithSuffix = `${date}st`;
    } else if ((dateRemOf10 === 2) && (dateRemOf100 !== 12)) {
        numberWithSuffix = `${date}nd`;
    } else if ((dateRemOf10 === 3) && (dateRemOf100 !== 13)) {
        numberWithSuffix = `${date}rd`;
    } else {
        numberWithSuffix = `${date}th`;
    }

    return numberWithSuffix;
}

const Battery = ({ charging, level }: {charging: boolean; level: number}) => {
    if (charging) {
        return (
            <IconBatteryCharging
                className="ml-2"
                size={30}
                stroke={1.5}
                strokeLinejoin="miter"
            />
        );
    }

    if (level === 100) {
        return (
            <IconBattery4
                className="ml-2"
                size={30}
                stroke={1.5}
                strokeLinejoin="miter"
            />
        );
    }

    if (level >= 75 && level < 100) {
        return (
            <IconBattery3
                className="ml-2"
                size={30}
                stroke={1.5}
                strokeLinejoin="miter"
            />
        );
    }

    if (level >= 50 && level < 75) {
        return (
            <IconBattery2
                className="ml-2"
                size={30}
                stroke={1.5}
                strokeLinejoin="miter"
            />
        );
    }

    return (
        <IconBattery1
            className="ml-2"
            size={30}
            stroke={1.5}
            strokeLinejoin="miter"
        />
    );
};

const BatteryLowWarning = (props: {onClose: () => void}) => (
    <div
        className="w-screen h-screen bg-black bg-opacity-90 absolute top-0 left-0 flex justify-center items-center"
        onClick={props.onClose}
    >
        <div
            className=" flex flex-col items-center w-1/3 h-1/3 bg-navy text-white object-center rounded-md overflow-hidden"
        >
            <div className="w-full p-2 border-b">
                <span>Connect charger cable</span>
            </div>
            <div className="flex-1">
                <span className="w-full p-2">Battery low. Less than 10% charge remaining</span>
                <IconBattery1 />
            </div>
            <div className="w-full flex justify-end p-4 bg-navy-500">
                <div className="flex justify-center items-center w-16 h-8 bg-navy-lighter rounded-md">
                    <span>Ok</span>
                </div>
            </div>
        </div>
    </div>

);

const StatusBar = (props: StatusBarProps) => {
    const [currentTime, setCurrentTime] = useState(props.initTime);
    const [showBatteryWarning, setShowBatteryWarning] = useState(false); // TODO: remove after testing

    const [charging, setCharging] = useState(-1);
    const [chargeTimerHandle, setChargeTimerHandle] = useState(-1);
    const [dc2BusPowered] = useSimVar('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'Bool', 1000);
    const [simRate] = useSimVar('SIMULATION RATE', 'number', 4000);

    const Power = useContext(PowerContext);

    function calculateTimeSinceStart(currentTime: Date) {
        const diff = currentTime.getTime() - props.initTime.getTime();
        const minutes = Math.floor(diff / 1000 / 60);
        const diffMinusMinutes = diff - (minutes * 1000 * 60);
        const seconds = Math.floor(diffMinusMinutes / 1000);

        return formatTime(([minutes, seconds]));
    }

    useEffect(() => {
        console.log({ dc2BusPowered, simRate, showBatteryWarning });
        if (dc2BusPowered !== charging) {
            clearInterval(chargeTimerHandle);
            const charge = dc2BusPowered;
            setCharging(charge);
            console.log('charging battery', charge);
            setChargeTimerHandle(setInterval(() => props.changeEfbBatteryLevel(charge ? 0.05 : -0.01), 1000));
        }

        return () => {
            clearInterval(chargeTimerHandle);
        };
    }, [dc2BusPowered, chargeTimerHandle]);

    useEffect(() => {
        // console.log('start timer');
        const timerHandle = setInterval(() => {
            const date = new Date();
            const timeSinceStart = calculateTimeSinceStart(date);
            props.updateCurrentTime(date);
            props.updateTimeSinceStart(timeSinceStart);
            setCurrentTime(date);
        }, 1000);

        return () => {
            // console.log('clear timer');
            clearInterval(timerHandle);
        };
    });

    const { efbClearState } = props;

    return (
        <div className="fixed w-full py-2 px-8 flex items-center justify-between bg-navy-medium text-white font-medium leading-none text-lg">
            <div className="flex items-center">
                <IconAccessPoint className="mr-2 animate-pulse" size={30} stroke={1.5} strokeLinejoin="miter" />
                flyPad
            </div>
            {/* TODO: remove onClick */}
            <div onClick={() => setShowBatteryWarning(true)}>{`${formatTime(([currentTime.getUTCHours(), currentTime.getUTCMinutes()]))}z`}</div>
            <div className="flex items-center">
                {props.batteryLevel.toFixed(3)}
                %

                {/* TODO find a way to use `setSimVar` here */}
                <Battery charging={dc2BusPowered} level={props.batteryLevel} />
                <IconPower
                    onClick={() => {
                        efbClearState();
                        Power.setContent(ContentState.OFF);
                    }}
                    className="ml-6"
                    size={25}
                    stroke={1.5}
                    strokeLinejoin="miter"
                />
            </div>

            {showBatteryWarning && (<BatteryLowWarning onClose={() => setShowBatteryWarning(false)} />)}
        </div>
    );
};

export default connect(
    ({ [EFB_BATTERY_REDUCER]: { batteryLevel } }) => ({ batteryLevel }),
    { efbClearState, changeEfbBatteryLevel },
)(StatusBar);
