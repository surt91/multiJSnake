from py4j.java_gateway import JavaGateway

gateway = JavaGateway()                        
gameState = gateway.entry_point.getGameState()
print(gameState)
gameState.setPause(False)
idx = gameState.addSnake()
snake = gameState.getSnakes()[idx]
print(snake.getHead().getX(), snake.getHead().getY())
gameState.update()
print(snake.getHead().getX(), snake.getHead().getY())


gateway.jvm.java.lang.System.out.println('Hello World!')
