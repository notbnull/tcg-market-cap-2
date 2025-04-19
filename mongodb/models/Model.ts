export default abstract class Model {
  public abstract getMongoModel(): Promise<unknown>;
}
