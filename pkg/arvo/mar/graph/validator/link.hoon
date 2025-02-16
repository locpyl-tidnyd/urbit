/-  *post, met=metadata-store, graph=graph-store, hark=hark-graph-hook
|_  i=indexed-post
++  grow
  |%
  ++  noun  i
  ::
  ++  graph-permissions-add
    |=  vip=vip-metadata:met
    ^-  permissions:graph
    =/  reader
      ?=(%reader-comments vip)
    ?+  index.p.i  !!
      [@ ~]       [%yes %yes %no]
      [@ @ ~]     [%yes %yes ?:(reader %yes %no)]
      [@ @ @ ~]   [%self %self %self]
    ==
  ::
  ++  graph-permissions-remove
    |=  vip=vip-metadata:met
    ^-  permissions:graph
    =/  reader
      ?=(%reader-comments vip)
    ?+  index.p.i  !!
      [@ ~]       [%yes %self %self]
      [@ @ ~]     [%yes %self %self]
      [@ @ @ ~]   [%yes %self %self]
    ==
  ::
  ++  notification-kind
    ^-  (unit notif-kind:hark)
    ?+  index.p.i  ~
      [@ ~]       `[%link [0 1] %each %children]
      [@ @ %1 ~]  `[%comment [1 2] %count %siblings]
    ==
  ::
  ++  transform-add-nodes
    |=  [=index =post =atom was-parent-modified=?]
    ^-  [^index ^post]
    =-  [- post(index -)]
    ?+    index  ~|(transform+[index post] !!)
        [@ ~]    [atom ~]
        [@ @ ~]  [i.index atom ~]
        [@ @ @ ~]
      ?:  was-parent-modified
        [i.index atom i.t.t.index ~]
      index
    ==
  --
++  grab
  |%
  ++  noun
    |:  p=`*`%*(. *indexed-post index.p [0 0 ~])
    =/  ip  ;;(indexed-post p)
    ?+    index.p.ip  ~|(index+index.p.ip !!)
        ::  top-level link post; title and url
        ::
        [@ ~]
      ?>  ?=([[%text @] $%([%url @] [%reference *]) ~] contents.p.ip)
      ip
    ::
        ::  comment on link post; container structure
        ::
        [@ @ ~]
      ?>  ?=(~ contents.p.ip)
      ip
    ::
        ::  comment on link post; comment text
        ::
        [@ @ @ ~]
      ?>  ?=(^ contents.p.ip)
      ip
    ==
  --
++  grad  %noun
--
