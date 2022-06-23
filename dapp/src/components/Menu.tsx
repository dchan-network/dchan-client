export default function Menu({ children }: any) {
  const els = children ? children.map ? children : [children] : []

  return (
    <details className="dchan-menu z-20 text-sm inline text-left opacity-10 hover:opacity-100">
      <summary className="top-0 px-1 h-4 relative"></summary>
      <div className="bg-secondary border border-solid border-black p-1 w-32 absolute z-50 pl-3">
        {els.map((child: any) => child)}
      </div>
    </details>
  );
}
