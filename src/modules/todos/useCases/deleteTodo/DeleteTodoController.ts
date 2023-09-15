import { Request, Response } from "express";
import { BaseController } from "../../../../shared/infra/http/models/Controller";
import { TodoDTO } from "../../dtos/TodoDTO";
import { DeleteTodoUseCase } from "./DeleteTodoUseCase";
import httpStatus from "http-status";
import { TodoEventEmitter } from "../../domain/events/TodoEventEmitter";
import { domainEventPublisher } from "../../infra/events/DomainEventPublisher";

export class DeleteTodoController extends BaseController {
  constructor(private useCase: DeleteTodoUseCase) {
    super();
  }

  async executeImpl(request: Request, response: Response): Promise<void> {
    const { id } = request.params;

    // Create a new TodoDTO with just the id
    const dto: TodoDTO = { id, title: "", status: "OPEN" }; // You might need to adjust this depending on your TodoDTO definition

    try {
      await this.useCase.execute(dto);
      const event = new TodoEventEmitter(dto.id);
      domainEventPublisher.emit("Publish", event, "deleted");
      response.status(httpStatus.CREATED).json("Deleted OK");
    } catch (err) {
      response.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
