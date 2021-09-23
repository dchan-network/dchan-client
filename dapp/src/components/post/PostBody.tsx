import { Post, shortenAddress, Thread } from 'dchan';
import { Router } from 'router';
import parseComment, { ParserResult, PostReferenceValue } from 'dchan/postparse';
import { ReactElement, useCallback, useEffect } from 'react';
import usePubSub from 'hooks/usePubSub';
import useWeb3 from 'hooks/useWeb3';

function TextQuote({children, post, thread}: {children: ParserResult[], post: Post, thread?: Thread}) {
  return (
    <span className="text-quote">
      &gt;{children.map(v => renderValue(v, post, thread))}
    </span>
  );
}

function Reference({link, children}: {link: string; children: string | string[]}) {
  return (
    <a
      className="text-blue-600 visited:text-purple-600 hover:text-blue-500"
      href={link}
    >
      &gt;&gt;{children}
    </a>
  );
}

function PostReference({post, thread, value}: {post: Post, thread?: Thread, value: PostReferenceValue}) {
  const { publish } = usePubSub();
  const postLink = `${value.id}/${value.n}`;

  const refPost = thread
    && [thread.op, ...thread.replies].find(p => `${p.from.id}/${p.n}` === postLink || `${shortenAddress(p.from.id)}/${p.n}` === postLink)

  useEffect(() => {
    const backlink = {
      from: post,
      to: {
        userId: value.id,
        n: value.n,
      }
    };
    //console.log(`Post ${post.n} sending backlink to ${value.n}`);
    publish("POST_BACKLINK", backlink);
  }, [post, value, publish]);

  const onMouseEnter = useCallback(
    () => {
      if (refPost != null) {
        publish("POST_HIGHLIGHT", refPost.id)
      }
    },
    [publish, refPost]
  );
  const onMouseLeave = useCallback(
    () => {
      if (refPost != null) {
        publish("POST_DEHIGHLIGHT", refPost.id)
      }
    },
    [publish, refPost]
  );

  const baseUrl = `${post.thread ? Router.thread(post.thread) : post.board ? Router.board(post.board) : ""}/`

  const { accounts } = useWeb3();

  const isOp = thread && refPost && thread.op.id === refPost.id;

  const isYou = accounts && accounts[0] && refPost && accounts[0] === refPost.from.address;

  return (
    <a
      className="text-blue-600 visited:text-purple-600 hover:text-blue-500"
      href={`#${baseUrl}${postLink}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      &gt;&gt;{postLink}{isOp ? " (OP)" : ""}{isYou ? " (You)" : ""}
    </a>
  );
}

function Spoiler({children, post, thread}: {children: ParserResult[], post: Post, thread?: Thread}) {
  return (
    <span className="dchan-post-spoiler">
      {children.map(v => renderValue(v, post, thread))}
    </span>
  );
}

function ExternalLink({link}: {link: string}) {
  return (
    <a
      className="text-blue-600 visited:text-purple-600 hover:text-blue-500"
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      {link}
    </a>
  );
}

function IPFSImage({hash}: {hash: string}) {
  return (
    <details className="inline">
      <summary>
        <a
          className="text-blue-600 visited:text-purple-600 hover:text-blue-500"
          href={`//ipfs.io/ipfs/${hash}`}
          target="_blank"
          rel="noreferrer"
        >
          {hash}
        </a>
      </summary>
      <img src={`//ipfs.io/ipfs/${hash}`} alt=""/>
    </details>
  );
}

function renderValue(val: ParserResult, post: Post, thread?: Thread): ReactElement | string {
  switch(val.type) {
    case "text":
      return val.value;
    case "link":
      return <ExternalLink link={val.value} />;
    case "ipfs":
      return <IPFSImage hash={val.hash} />;
    case "newline":
      return <br/>;
    case "textquote":
      return <TextQuote post={post} thread={thread}>{val.value}</TextQuote>;
    case "ref":
      return <Reference link={`#/${val.id}`}>{val.id}</Reference>;
    case "postref":
      return <PostReference post={post} thread={thread} value={val} />;
    case "boardref":
      return <Reference link={`#/${val.id}`}>{val.board}{val.id}</Reference>;
    case "spoiler":
      return <Spoiler post={post} thread={thread}>{val.value}</Spoiler>;
  }
}

export default function PostBody({post, thread, style = {}, className}: {style?: any, className?: string, thread?: Thread, post: Post}) {
  return (
    <div
      className={className + " block text-left break-words font-sans text-sm max-w-100vw"}
      style={style}
    >
      {parseComment(post.comment).map(v => renderValue(v, post, thread))}
    </div>
  )
}