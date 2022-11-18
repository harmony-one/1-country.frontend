cd ..
slither . --print inheritance-graph
mv *.dot ./docs/slither/.
cd ./docs/slither
dot inheritance-graph.dot -Tpng -o inheritance-graph.png
rm *.dot
cd ../..