import classnames from 'classnames';

export default function Card(props) {
  return (
    <div
      {...props}
      className={classnames(' bg-white w-full rounded-lg border border-orange-200 ')}
    />
  );
}
