import * as React from 'react';

import './NodeDetails.css';
import Sortable from 'react-sortablejs';
import { Clause } from '../model/unit';
import { Literal } from '../model/literal';
import SatNode from '../model/sat-node';

type Props = {
  node: SatNode,
  numberOfTransitiveActivatedChildren: number,
  onLiteralOrientationChange: (nodeId: number, oldPosition: ["premise" | "conclusion" | "context", number], newPosition: ["premise" | "conclusion" | "context", number]) => void,
  onLiteralRepresentationChange: (nodeId: number, literal: Literal) => void
};

export default class NodeDetails extends React.Component<Props, {}> {

  keep=false; // hack to skip each second event generated by Sortable

  render() {
    const statisticsStrings = new Array<string>();
    for (const [key, value] of this.props.node.statistics) {
      statisticsStrings.push(`${key}: ${value}`);
    }
    
    return (
      <section className={'component-node-details details'}>
        <article>
          <h2>Node <strong>{this.props.node.id}, </strong></h2>
          <h3>{this.props.node.inferenceRule}</h3>
          <h3>{this.props.numberOfTransitiveActivatedChildren} {this.props.numberOfTransitiveActivatedChildren === 1 ? "child" : "children"}</h3>
          <h3>{statisticsStrings.join(", ")}</h3>
          {
            this.props.node.unit.type === "Formula" ? (
              <section className={'literal-wrapper'}>
                {
                  this.props.node.toString()
                }
              </section>
            ) : (
              <section className={'literal-wrapper'}>
                {
                  this.toList(this.props.node.id, this.props.node.unit as Clause, "premise")
                }
                <br/>
                {
                  this.toList(this.props.node.id, this.props.node.unit as Clause, "conclusion")
                }
                <br/>
                {
                  this.toList(this.props.node.id, this.props.node.unit as Clause, "context")
                }
              </section>
            )
          }
        </article>
      </section>
    );
  }

  toList = (nodeId: number, clause: Clause, orientation: "premise" | "conclusion" | "context") => {
    const literals = orientation === "premise" ? clause.premiseLiterals : (orientation === "conclusion" ? clause.conclusionLiterals : clause.contextLiterals);
  
    return (
      <Sortable
        options={{
          group: 'shared'
        }}
        tag={"ul"}
        id={orientation === "premise" ? "id1" : (orientation === "conclusion" ? "id2" : "id3")}
        onChange={(_items, _sortable, event)=>{
          // Hack: Sortable generates two identical events (one for each modified list), so we need to ignore one of them
          this.keep = !this.keep;
          if (this.keep) {
            const from = event.from.id === "id1" ? "premise" : event.from.id === "id2" ? "conclusion" : "context";
            const to = event.to.id === "id1" ? "premise" : event.to.id === "id2" ? "conclusion" : "context";
            this.props.onLiteralOrientationChange(nodeId, [from, event.oldIndex], [to, event.newIndex]);
          }
        }}
      >
        {
          literals.map((literal, index) => this.toListItem(literal, index, orientation))
        }
      </Sortable>
      )
    };
  
  toListItem = (literal: Literal, index: number, orientation: "premise" | "conclusion" | "context") => {
    return <li key={index} data-id={index} onDoubleClick={(event) => {
      this.props.onLiteralRepresentationChange(this.props.node.id, literal);
      event.currentTarget.innerText = literal.toString(orientation === "premise");
    }}>{literal.toString(orientation === "premise")}</li>
  };
}
