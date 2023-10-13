import clsx from "clsx";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function Container(props: ContainerProps) {
    let { children, className } = props;
    return (
        <div className={clsx('container mx-auto px-4 max-w-screen-xl', className)}>
            {children}
        </div>
    );
}