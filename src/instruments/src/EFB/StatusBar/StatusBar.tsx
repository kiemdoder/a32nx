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

const StatusBar = (props: StatusBarProps) => {
    const [currentTime, setCurrentTime] = useState(props.initTime);

    const [chargeTimerHandle, setChargeTimerHandle] = useState(-1);
    const [dischargeTimerHandle, setDischargeTimerHandle] = useState(-1);
    const [dc2BusPowered] = useSimVar('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'Bool', 1000);

    const Power = useContext(PowerContext);

    function calculateTimeSinceStart(currentTime: Date) {
        const diff = currentTime.getTime() - props.initTime.getTime();
        const minutes = Math.floor(diff / 1000 / 60);
        const diffMinusMinutes = diff - (minutes * 1000 * 60);
        const seconds = Math.floor(diffMinusMinutes / 1000);

        return formatTime(([minutes, seconds]));
    }

    useEffect(() => {
        console.log({ dc2BusPowered });
        if (dc2BusPowered) {
            clearInterval(dischargeTimerHandle);
            setDischargeTimerHandle(-1);
            if (chargeTimerHandle === -1) {
                console.log('charge battery');
                setChargeTimerHandle(setInterval(() => props.changeEfbBatteryLevel(0.05), 1000));
            }
        } else {
            clearInterval(chargeTimerHandle);
            setChargeTimerHandle(-1);
            if (dischargeTimerHandle === -1) {
                console.log('discharge battery');
                setDischargeTimerHandle(setInterval(() => props.changeEfbBatteryLevel(-0.01), 1000));
            }
        }

        return () => {
            clearInterval(chargeTimerHandle);
            clearInterval(dischargeTimerHandle);
        };
    }, [dc2BusPowered, chargeTimerHandle, dischargeTimerHandle]);

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
            <div>{`${formatTime(([currentTime.getUTCHours(), currentTime.getUTCMinutes()]))}z`}</div>
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
        </div>
    );
};

export default connect(
    ({ [EFB_BATTERY_REDUCER]: { batteryLevel } }) => ({ batteryLevel }),
    { efbClearState, changeEfbBatteryLevel },
)(StatusBar);
