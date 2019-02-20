"""TODO"""

from flask import session

import proof_visualization.controller.json_util as json
from proof_visualization.controller.representation_util import compute_representation, legend
from proof_visualization.model.dag import Dag
from proof_visualization.model.parsing import process
from proof_visualization.model.positioning import calculate_node_positions

from proof_visualization.model.transformations import filterNonConsequences
from proof_visualization.model.transformations import filterNonParents


def init_controller():
    with open('example.proof') as proof_file:
        file_content = proof_file.read()
        init_dag(file_content)
    session['history_state'] = session['dag'].lastStep()

def init_dag(file_content):
    dag = process(file_content)
    positions = calculate_node_positions(dag)

    # store in session
    session['dag'] = dag
    session['positions'] = positions

def get_layout():
    """Use data stored in session to create a graph layout for vis.js."""

    dag = session.get('dag')
    positions = session.get('positions')
    history_state = int(session['history_state'])

    nodes = []
    edges = []
        
    for node_position in positions:
        node = dag.get(int(node_position.id_))
        assert(node)

        # append representation jsons for node
        representation = compute_representation(node, history_state)
        nodes.append(json.format_node(node, node_position, representation))

        # append representation jsons for edges
        edge_visible = node.new_time and node.new_time <= history_state

        for parentId in node.parents:
            parentNode = dag.get(parentId)
            assert(parentNode)
            
            edgeData = (parentId, node.number, edge_visible)
            edges.append(json.format_edge(*edgeData))

    return json.dump_graph(nodes, edges, list(dag.nodes.keys()))


def get_legend():
    return legend()

def filter_non_consequences(selection):
    oldDag = session['dag']

    # store dag for reset
    session['old_dag'] = oldDag
    session['old_positions'] = session['positions']

    # generate new dag
    relevantNodeIds = set()
    for e in selection:
        relevantNodeIds.add(int(e))
    dag = filterNonConsequences(oldDag, relevantNodeIds)
    positions = calculate_node_positions(dag)

    # store in session
    session['dag'] = dag
    session['positions'] = positions
    session['history_state'] = dag.lastStep()

def filter_non_parents(selection):
    oldDag = session['dag']

    # store dag for reset
    session['old_dag'] = oldDag
    session['old_positions'] = session['positions']

    # generate new dag
    relevantNodeIds = set()
    for e in selection:
        relevantNodeIds.add(int(e))
    dag = filterNonParents(oldDag, relevantNodeIds)
    positions = calculate_node_positions(dag)

    # store in session
    session['dag'] = dag
    session['positions'] = positions
    session['history_state'] = dag.lastStep()

def reset_dag():
    if session.get('old_dag'):
        session['dag'] = session['old_dag']
        session['positions'] = session['old_positions']


