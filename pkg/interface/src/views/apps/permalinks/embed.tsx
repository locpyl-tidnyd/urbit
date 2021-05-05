import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import {
  parsePermalink,
  GraphPermalink as IGraphPermalink,
  getPermalinkForGraph,
  usePermalinkForGraph,
} from "~/logic/lib/permalinks";
import {
  Action,
  Box,
  Text,
  BaseAnchor,
  Row,
  Icon,
  Col,
  Center
} from "@tlon/indigo-react";
import { GroupLink } from "~/views/components/GroupLink";
import GlobalApi from "~/logic/api/global";
import { getModuleIcon } from "~/logic/lib/util";
import useMetadataState from "~/logic/state/metadata";
import { Association, resourceFromPath, GraphNode } from "@urbit/api";
import { Link, useLocation } from "react-router-dom";
import useGraphState from "~/logic/state/graph";
import { GraphNodeContent } from "../notifications/graph";
import { TranscludedNode } from "./TranscludedNode";
import {useVirtualResizeProp} from "~/logic/lib/virtualContext";

function GroupPermalink(props: { group: string; api: GlobalApi }) {
  const { group, api } = props;
  return (
    <GroupLink
      resource={group}
      api={api}
      pl="2"
      border="1"
      borderRadius="2"
      borderColor="lightGray"
    />
  );
}

function GraphPermalink(
  props: IGraphPermalink & {
    api: GlobalApi;
    transcluded: number;
    pending?: boolean;
    showOurContact?: boolean;
    full?: boolean;
  }
) {
  const { full = false, showOurContact, pending, link, graph, group, index, api, transcluded } = props;
  const history = useHistory();
  const location = useLocation();
  const { ship, name } = resourceFromPath(graph);
  const node = useGraphState(
    useCallback((s) => s.looseNodes?.[`${ship.slice(1)}/${name}`]?.[index] as GraphNode, [
      graph,
      index,
    ])
  );
  const [errored, setErrored] = useState(false);
  const association = useMetadataState(
    useCallback((s) => s.associations.graph[graph] as Association | null, [
      graph,
    ])
  );

  useVirtualResizeProp(!!node)
  useEffect(() => {
    (async () => {
      if (pending || !index) {
        return;
      }
      try {
        await api.graph.getNode(ship, name, index);
      } catch (e) {
        console.log(e);
        setErrored(true);
      }
    })();
  }, [pending, graph, index]);
  const showTransclusion = !!(association && node && transcluded < 1);
  const permalink = getPermalinkForGraph(group, graph, index);

  const navigate = (e) => {
    e.stopPropagation();
    history.push(`/perma${permalink.slice(16)}`);
  };

  const [nodeGroupHost, nodeGroupName] = association?.group.split('/').slice(-2);
  const [nodeChannelHost, nodeChannelName] = association?.resource
    .split('/')
    .slice(-2);
  const [
    locChannelName,
    locChannelHost,
    ,
    ,
    ,
    locGroupName,
    locGroupHost
  ] = location.pathname.split('/').reverse();

  const isInSameResource =
    locChannelHost === nodeChannelHost &&
    locChannelName === nodeChannelName &&
    locGroupName === nodeGroupName &&
    locGroupHost === nodeGroupHost;

  return (
    <Col
      width="100%"
      bg="white"
      maxWidth={full ? null : "500px"}
      border={full ? null : "1"}
      borderColor='lightGray'
      borderRadius="2"
      cursor='pointer'
      onClick={(e) => {
        navigate(e);
      }}
    >
      {showTransclusion && index && (
        <TranscludedNode
          api={api}
          transcluded={transcluded + 1}
          node={node}
          assoc={association!}
          showOurContact={showOurContact}
        />
      )}
      {!!association ? (
        <PermalinkDetails
          known
          showTransclusion={showTransclusion}
          showDetails={!isInSameResource}
          icon={getModuleIcon(association.metadata.config.graph)}
          title={association.metadata.title}
          permalink={permalink}
        />
      ) : (
        <PermalinkDetails
          icon="Groups"
          title={graph.slice(5)}
          permalink={permalink}
        />
      )}
    </Col>
  );
}

function PermalinkDetails(props: {
  title: string;
  icon: any;
  permalink: string;
  showTransclusion?: boolean;
  showDetails?: boolean;
  known?: boolean;
}) {
  const { title, icon, permalink, known, showTransclusion , showDetails } = props;
  const rowTransclusionStyle = showTransclusion
    ? { p: '12px 12px 11px 11px' }
    : { p: '12px' };

  if (showDetails) {
    return (
      <Row
        {...rowTransclusionStyle}
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Row gapX="2" alignItems="center">
          <Box width={4} height={4}>
            <Center width={4} height={4}>
              <Icon icon={icon} color='gray' />
            </Center>
          </Box>
          <Text gray mono={!known}>
            {title}
          </Text>
        </Row>
      </Row>
    );
  } else {
    return (
      <Row
        height='12px'
        width="100%"
      />
    );
  }
}

export function PermalinkEmbed(props: {
  link: string;
  association?: Association;
  api: GlobalApi;
  transcluded: number;
  showOurContact?: boolean;
  full?: boolean;
}) {
  const permalink = parsePermalink(props.link);

  if (!permalink) {
    return <BaseAnchor href={props.link}>{props.link}</BaseAnchor>;
  }

  switch (permalink.type) {
    case "group":
      return <GroupPermalink group={permalink.group} api={props.api} />;
    case "graph":
      return (
        <GraphPermalink
          transcluded={props.transcluded}
          {...permalink}
          api={props.api}
          full={props.full}
          showOurContact={props.showOurContact}
        />
      );
  }
}
