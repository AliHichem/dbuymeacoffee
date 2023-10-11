import classnames from 'classnames';

export const Card = (props: any) => {
    return (
        <div
            {...props}
            className={classnames(' bg-white w-full rounded-lg border border-orange-200 ')}
        />
    );
}
